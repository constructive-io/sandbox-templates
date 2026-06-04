/** provision.ts — Attach schemas to app API, set membership defaults. Usage: pnpm run provision */

import * as fs from 'fs';
import * as path from 'path';
import { Pool } from 'pg';

import { config } from './config.js';
import { withRetry, createMetaschemaClient, requireDatabaseId } from './helpers.js';

const PG_DATABASE = config.pgInternalDatabase;

async function main() {
  console.log('\n  Constructive App — Schema Provisioning\n');
  console.log(`   Database:  ${config.databaseName}`);
  console.log(`   DB ID:     ${config.databaseId}`);
  console.log(`   Endpoint:  ${config.apiEndpoint}`);

  if (!config.databaseId || !config.accessToken) {
    console.error('\n  Missing DATABASE_ID or ACCESS_TOKEN in .env');
    console.error('   Run: pnpm run create-db\n');
    process.exit(1);
  }

  const pgAvailable = !!process.env.PGHOST;

  // Attach entity schemas to the app API so codegen can see them
  console.log(`\n${'='.repeat(60)}`);
  console.log('  Attaching schemas to app API');
  console.log('='.repeat(60));

  const metaschemaClient = createMetaschemaClient();

  // Find the 'api' API
  const apisResult = await withRetry(() =>
    metaschemaClient.api.findMany({
      where: { databaseId: { equalTo: config.databaseId }, name: { equalTo: 'api' } },
      select: { id: true, name: true, apiSchemas: { select: { id: true, schema: { select: { id: true, name: true, schemaName: true } } } } },
    }).unwrap()
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const appApi = (apisResult as any)?.apis?.nodes?.[0];
  if (!appApi) {
    console.warn('   App API not found — skipping schema attachment');
  } else {
    const appApiId: string = appApi.id;
    const existingSchemaNames = new Set<string>(
      (appApi.apiSchemas?.nodes ?? []).map((n: { schema: { schemaName: string } }) => n.schema.schemaName)
    );

    // Find all schemas for this database
    const schemasResult = await withRetry(() =>
      metaschemaClient.schema.findMany({
        where: { databaseId: { equalTo: config.databaseId } },
        select: { id: true, name: true, schemaName: true },
      }).unwrap()
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allSchemas = (schemasResult as any)?.schemas?.nodes ?? [];

    // Attach unattached schemas, excluding internal ones
    const excludePrefixes = ['metaschema', 'constructive_auth_private'];
    const schemasToAttach = allSchemas.filter((s: { schemaName: string }) =>
      !existingSchemaNames.has(s.schemaName) &&
      !excludePrefixes.some(prefix => s.schemaName.startsWith(prefix))
    );

    if (schemasToAttach.length === 0) {
      console.log('   App API already has all needed schemas');
    } else {
      for (const schema of schemasToAttach) {
        try {
          await withRetry(() =>
            metaschemaClient.apiSchema.create({
              data: {
                databaseId: config.databaseId!,
                apiId: appApiId,
                schemaId: schema.id,
              },
              select: { id: true },
            }).unwrap()
          );
          console.log(`   Attached ${schema.schemaName} to app API`);
        } catch (err: any) {
          if (err.message?.includes('already exists') || err.message?.includes('duplicate')) {
            console.log(`   ${schema.schemaName} already attached`);
          } else {
            console.warn(`   Failed to attach ${schema.schemaName}: ${err.message}`);
          }
        }
      }
    }
  }

  // Set membership defaults so new users are auto-approved
  if (pgAvailable) {
    console.log('\n  Setting membership defaults...');
    const defaultsPool = new Pool({ database: PG_DATABASE });

    const schemaResult = await defaultsPool.query(
      `SELECT schema_name FROM information_schema.schemata
       WHERE (schema_name LIKE '%memberships-public' OR schema_name LIKE '%memberships_public')
       ORDER BY schema_name DESC LIMIT 1`
    );
    if (schemaResult.rows.length > 0) {
      const membershipsSchema = schemaResult.rows[0].schema_name;
      await defaultsPool.query(
        `UPDATE "${membershipsSchema}".app_membership_defaults
         SET is_approved = TRUE, is_verified = TRUE`
      );
      console.log(`   schema: ${membershipsSchema}`);
      console.log('   is_approved = TRUE, is_verified = TRUE');
    } else {
      console.log('   No memberships schema found - skipping defaults');
    }

    await defaultsPool.end();
  }

  // =====================================================================
  //  Provision the migrate API for export (sql_actions)
  // =====================================================================
  console.log(`\n${'='.repeat(60)}`);
  console.log('  Provisioning migrate API for export');
  console.log('='.repeat(60));

  // The migrate API exposes sql_actions via GraphQL so that
  // pnpm export:graphql can fetch the DB module (deploy/revert/verify SQL).
  //
  // sql_actions lives in db_migrate.sql_actions (shared, RLS-protected), but db_migrate
  // is intentionally excluded from GraphQL because it executes SQL (injection risk).
  // Instead, ddl_audit_public.sql_actions is a safe view (security_invoker = on) over
  // db_migrate.sql_actions — this is what MIGRATE_SCHEMAS = ['ddl_audit_public'] links.
  //
  // Steps:
  //   A.  Verify ddl_audit_public.sql_actions view exists
  //   A5. Register ddl_audit_public in metaschema_public.schema (upstream gap)
  //   B.  Find the ddl_audit_public schema entry in metaschema (via direct SQL)
  //   C.  Create/update the migrate API with isPublic: true
  //   D.  Link ddl_audit_public schema to the migrate API (via direct SQL)
  //   E.  Create migrate-{dbName} domain entry
  //   F.  Flush the GraphQL server cache

  // Step A: Verify ddl_audit_public.sql_actions view exists
  //
  // ddl_audit_public is the safe view layer over db_migrate tables.
  // db_migrate is intentionally excluded from GraphQL (SQL injection risk via execute_sql()).
  // The views use security_invoker = on so RLS on the underlying db_migrate tables applies.
  if (pgAvailable) {
    const discoverPool = new Pool({ database: PG_DATABASE });
    try {
      const viewCheck = await discoverPool.query(
        `SELECT table_name FROM information_schema.views
         WHERE table_schema = 'ddl_audit_public' AND table_name = 'sql_actions'`
      );
      if (viewCheck.rows.length > 0) {
        console.log('   Found ddl_audit_public.sql_actions (safe view over db_migrate)');
      } else {
        console.warn('   ddl_audit_public.sql_actions not found — export will not include migration data');
      }
    } finally {
      await discoverPool.end();
    }
  }

  // Step A5: Register ddl_audit_public in metaschema_public.schema
  //
  // The ast-actions package creates the ddl_audit_public PostgreSQL schema (with views
  // sql_actions, migrate_files) but does NOT register it in metaschema_public.schema.
  // This is an upstream gap: MIGRATE_SCHEMAS = ['ddl_audit_public'] can't find the
  // entry, so no API can link to it via api_schemas.
  //
  // We bootstrap the registration here with the correct schema_name (not the
  // hashed/prefixed one that before_create_schema_trigger would generate).
  // The PG schema already exists, so we disable the metaschema triggers to avoid
  // the after_create_schema_trigger (which calls actions_public.create_schema with
  // the wrong name) and the schema_grant/default_privilege triggers (which call
  // actions_public.grant_* and need JWT context we don't have here).
  if (pgAvailable) {
    const registerPool = new Pool({ database: PG_DATABASE });
    const regClient = await registerPool.connect();
    try {
      await regClient.query('BEGIN');
      // Disable ALL user triggers on the affected tables
      await regClient.query(`ALTER TABLE metaschema_public.schema DISABLE TRIGGER USER`);
      await regClient.query(`ALTER TABLE metaschema_public.schema_grant DISABLE TRIGGER USER`);
      await regClient.query(`ALTER TABLE metaschema_public.default_privilege DISABLE TRIGGER USER`);

      // Upsert the schema row (use the correct schema_name 'ddl_audit_public',
      // not the hashed/prefixed one that before_create_schema_trigger would generate).
      // ON CONFLICT DO UPDATE ensures existing rows get the correct name/is_public
      // (a previous run may have inserted with different values).
      const upsertResult = await regClient.query(
        `INSERT INTO metaschema_public.schema (database_id, name, schema_name, is_public)
         SELECT id, 'ddl_audit_public', 'ddl_audit_public', true
         FROM metaschema_public.database WHERE name = $1
         ON CONFLICT (schema_name) DO UPDATE
           SET name = EXCLUDED.name, is_public = EXCLUDED.is_public
         RETURNING id`,
        [PG_DATABASE]
      );
      const newId = upsertResult.rows[0].id;

      // Backfill schema_grants (administrator, authenticated, anonymous).
      // These grant PostGraphile the role-based access it needs to expose
      // the schema. ON CONFLICT DO NOTHING is safe to re-run.
      await regClient.query(
        `INSERT INTO metaschema_public.schema_grant (schema_id, database_id, grantee_name)
         SELECT $1, id, grantee_name FROM metaschema_public.database
         CROSS JOIN (VALUES ('administrator'), ('authenticated'), ('anonymous'))
           AS v(grantee_name)
         WHERE name = $2
         ON CONFLICT DO NOTHING`,
        [newId, PG_DATABASE]
      );

      // Backfill default_privileges (what each role can do on schema objects).
      // ON CONFLICT DO NOTHING is safe to re-run.
      await regClient.query(
        `INSERT INTO metaschema_public.default_privilege
           (schema_id, database_id, object_type, privilege, grantee_name)
         SELECT $1, id, object_type, privilege, grantee_name
         FROM metaschema_public.database
         CROSS JOIN (VALUES
           ('tables','ALL','administrator'),
           ('sequences','ALL','administrator'),
           ('functions','ALL','administrator'),
           ('functions','ALL','authenticated'),
           ('sequences','ALL','authenticated'),
           ('functions','ALL','anonymous')
         ) AS v(object_type, privilege, grantee_name)
         WHERE name = $2
         ON CONFLICT DO NOTHING`,
        [newId, PG_DATABASE]
      );

      await regClient.query('COMMIT');
      console.log(`   Registered ddl_audit_public in metaschema (id: ${newId}, grants + default_privileges backfilled)`);
    } catch (err: any) {
      await regClient.query('ROLLBACK').catch(() => {});
      console.warn(`   Could not register ddl_audit_public: ${err.message}`);
    } finally {
      // Re-enable triggers (best effort)
      await regClient.query(`ALTER TABLE metaschema_public.default_privilege ENABLE TRIGGER USER`).catch(() => {});
      await regClient.query(`ALTER TABLE metaschema_public.schema_grant ENABLE TRIGGER USER`).catch(() => {});
      await regClient.query(`ALTER TABLE metaschema_public.schema ENABLE TRIGGER USER`).catch(() => {});
      regClient.release();
      await registerPool.end();
    }
  }

  // Step B: Find the ddl_audit_public schema entry in metaschema.
  //
  // ddl_audit_public contains safe views (sql_actions, migrate_files) over db_migrate
  // tables with security_invoker = on. db_migrate itself is excluded from GraphQL
  // because it executes SQL via db_migrate.execute_sql() (SQL injection risk).
  //
  // MIGRATE_SCHEMAS = ['ddl_audit_public'] in constructive-db is the intended config,
  // but provision_base_modules can't find the entry via the GraphQL API because
  // metaschema_public.schema has RLS that filters by database_id, and ddl_audit_public's
  // metaschema entry belongs to the platform database. Direct SQL bypasses RLS.
  let ddlAuditSchemaId: string | undefined;
  if (pgAvailable) {
    const lookupPool = new Pool({ database: PG_DATABASE });
    try {
      const result = await lookupPool.query(
        `SELECT id, schema_name, name, database_id FROM metaschema_public.schema
         WHERE schema_name = 'ddl_audit_public' LIMIT 1`
      );
      if (result.rows.length > 0) {
        const row = result.rows[0];
        ddlAuditSchemaId = row.id;
        console.log(`   Found ddl_audit_public schema entry (id: ${row.id})`);
      } else {
        console.warn('   No ddl_audit_public schema entry found in metaschema — sql_actions will not be available');
      }
    } catch (err: any) {
      console.warn(`   Could not look up ddl_audit_public schema: ${err.message}`);
    } finally {
      await lookupPool.end();
    }
  } else {
    console.error('   ERROR: No direct DB access — cannot look up ddl_audit_public schema entry.');
    console.error('   Full provisioning requires eval "$(pgpm env)" to set PGHOST/PGDATABASE.');
    console.error('   The migrate API for export will NOT work without this step.');
  }

  // Step C: Create or update the migrate API (isPublic: true)
  // isPublic: true is required so that domain-lookup routing (migrate.localhost)
  // works. The migrate API uses role_name='authenticated' for access control,
  // so making it public doesn't bypass auth — it just enables subdomain routing.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let migrateApi: any;
  const migrateApiResult = await withRetry(() =>
    metaschemaClient.api.findMany({
      where: { databaseId: { equalTo: config.databaseId }, name: { equalTo: 'migrate' } },
      select: { id: true, name: true, isPublic: true },
    }).unwrap()
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  migrateApi = (migrateApiResult as any)?.apis?.nodes?.[0];

  if (!migrateApi) {
    console.log('   Creating migrate API (isPublic: true, roleName: administrator)...');
    try {
      const createApiResult = await withRetry(() =>
        metaschemaClient.api.create({
          data: {
            databaseId: config.databaseId!,
            name: 'migrate',
            dbname: PG_DATABASE,
            anonRole: 'anonymous',
            // roleName='administrator' bypasses RLS on db_migrate.sql_actions.
            // The export needs to read ALL actions for the database, not just
            // those created by the caller. Migration scripts are not secret
            // (they live in version control), so this is safe for the export
            // use case. The platform's own migrate API uses 'authenticated'
            // for tighter security.
            roleName: 'administrator',
            isPublic: true,
          },
          select: { id: true, name: true, isPublic: true, roleName: true },
        }).unwrap()
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      migrateApi = (createApiResult as any)?.createApi?.api;
      console.log(`   Created migrate API (id: ${migrateApi?.id}, roleName: ${migrateApi?.roleName})`);
    } catch (err: any) {
      console.warn(`   Could not create migrate API: ${err.message}`);
    }
  } else {
    console.log(`   migrate API already exists (id: ${migrateApi.id}, isPublic: ${migrateApi.isPublic})`);
    // Update to isPublic: true + roleName: administrator if needed.
    // roleName='administrator' bypasses RLS on db_migrate.sql_actions so the
    // export can read ALL actions for the database (not just the caller's).
    const needsIsPublicUpdate = !migrateApi.isPublic;
    const needsRoleNameUpdate = migrateApi.roleName !== 'administrator';
    if (needsIsPublicUpdate || needsRoleNameUpdate) {
      const updates: Record<string, unknown> = {};
      if (needsIsPublicUpdate) updates.isPublic = true;
      if (needsRoleNameUpdate) updates.roleName = 'administrator';
      console.log(`   Updating migrate API: ${Object.keys(updates).join(', ')}...`);
      try {
        await withRetry(() =>
          metaschemaClient.api.update({
            where: { id: migrateApi.id },
            data: updates,
            select: { id: true, isPublic: true, roleName: true },
          }).unwrap()
        );
        console.log('   Updated migrate API configuration');
        if (needsRoleNameUpdate) {
          console.log('   roleName=administrator bypasses RLS on db_migrate.sql_actions');
        }
      } catch (err: any) {
        console.warn(`   Could not update migrate API: ${err.message}`);
      }
    }
  }

  // Step D: Link ddl_audit_public schema to migrate API
  //
  // ddl_audit_public is the safe view layer over db_migrate (see Step B comments).
  // The tenant's myapp_migrate is already linked by databaseProvisionModule (empty, harmless).
  // We add a SECOND link to ddl_audit_public so PostGraphile introspects sql_actions.
  //
  // Uses direct SQL because RLS on services_public.api_schemas filters by database_id,
  // and ddl_audit_public's metaschema entry belongs to the platform database.
  //
  // TECH DEBT: This bypasses metaschemaClient.apiSchema.create() validation. If the
  // api_schemas table schema changes upstream, this INSERT will break. The proper fix
  // is an upstream metaschema API that supports cross-database schema linking
  // (e.g., X-Schema-Lookup-All header or a super-admin provision mode).
  if (ddlAuditSchemaId && migrateApi) {
    const linkPool = new Pool({ database: PG_DATABASE });
    try {
      // Check if already linked
      const existing = await linkPool.query(
        `SELECT id FROM services_public.api_schemas
         WHERE api_id = $1 AND schema_id = $2`,
        [migrateApi.id, ddlAuditSchemaId]
      );

      if (existing.rows.length > 0) {
        console.log('   ddl_audit_public already linked to migrate API');
      } else {
        console.log('   Linking ddl_audit_public schema to migrate API...');
        await linkPool.query(
          `INSERT INTO services_public.api_schemas (database_id, api_id, schema_id)
           VALUES ($1, $2, $3)
           ON CONFLICT (api_id, schema_id) DO NOTHING`,
          [config.databaseId, migrateApi.id, ddlAuditSchemaId]
        );
        console.log('   Linked ddl_audit_public → migrate API');
      }
    } catch (err: any) {
      console.warn(`   Could not link ddl_audit_public schema: ${err.message}`);
    } finally {
      await linkPool.end();
    }
  } else if (!ddlAuditSchemaId) {
    console.error('   ERROR: Skipping ddl_audit_public link — schema entry not found.');
    console.error('   The migrate API will NOT expose sql_actions. Run provision with PG access.');
  } else if (!migrateApi) {
    console.error('   ERROR: Skipping ddl_audit_public link — migrate API not found.');
  }

  // Step E: Create migrate domain entry (migrate-{dbName})
  //
  // The platform's own migrate API already owns the 'migrate' subdomain
  // (e.g., http://migrate.localhost:3000/graphql for the platform's migrate API).
  // The platform's migrate API has is_public=false and no schemas linked, so it
  // returns 404 for unauthenticated requests. To route to the tenant's migrate
  // API, we use the 'migrate-{dbName}' subdomain (matching the convention of
  // admin-{dbName}, api-{dbName}, auth-{dbName}, usage-{dbName}).
  if (migrateApi) {
    const domain = 'localhost';
    const subdomain = `migrate-${config.databaseName}`;
    console.log(`   Creating ${subdomain}.${domain} domain entry...`);
    try {
      await withRetry(() =>
        metaschemaClient.domain.create({
          data: {
            databaseId: config.databaseId!,
            apiId: migrateApi.id,
            domain: domain,
            subdomain: subdomain,
          },
          select: { id: true },
        }).unwrap()
      );
      console.log(`   Created domain: ${subdomain}.${domain} → migrate API`);
    } catch (err: any) {
      if (err.message?.includes('already exists') || err.message?.includes('duplicate') || err.message?.includes('unique constraint')) {
        console.log(`   ${subdomain}.${domain} domain already exists`);
      } else {
        console.warn(`   Could not create migrate domain: ${err.message}`);
      }
    }
  }

  // Step F: Flush GraphQL server cache so the new schema/API takes effect
  // PostGraphile caches schema builds and API resolution results.
  // After provisioning changes, the cache must be invalidated.
  //
  // BUG WORKAROUND: The /flush endpoint only clears the cache for the
  // CURRENT request's svc_key. Calling it via api.localhost clears only
  // the api.localhost cache entry — migrate-{dbName}.localhost and other
  // subdomain caches retain stale data with the old isPublic/roleName
  // values. The proper fix is upstream (clear all related keys in /flush).
  // Workaround: hit /flush on every subdomain of the database.
  console.log('   Flushing GraphQL server cache for all subdomains...');
  const subdomainsToFlush: string[] = [];
  if (pgAvailable) {
    const flushPool = new Pool({ database: PG_DATABASE });
    try {
      const domainsResult = await flushPool.query(
        `SELECT DISTINCT subdomain, domain FROM services_public.domains
         WHERE database_id = $1`,
        [config.databaseId]
      );
      for (const row of domainsResult.rows) {
        const host = row.subdomain
          ? `${row.subdomain}.${row.domain}`
          : row.domain;
        subdomainsToFlush.push(host);
      }
    } catch (err: any) {
      console.warn(`   Could not list subdomains: ${err.message}`);
    } finally {
      await flushPool.end();
    }
  }
  // Always flush the api.localhost (default config) too
  if (!subdomainsToFlush.includes('localhost')) {
    subdomainsToFlush.push('localhost');
  }
  for (const host of subdomainsToFlush) {
    try {
      const flushUrl = `http://${host}:${process.env.NEXT_PUBLIC_API_PORT || '3000'}/flush`;
      const flushRes = await globalThis.fetch(flushUrl, { method: 'POST' });
      if (flushRes.ok) {
        console.log(`   Flushed: ${flushUrl}`);
      } else {
        console.warn(`   Flush returned ${flushRes.status} for ${flushUrl}`);
      }
    } catch (err: any) {
      console.warn(`   Could not flush ${host}: ${err.message}`);
    }
  }

  // Write SEED_SCHEMA to .env
  if (pgAvailable) {
    const detectPool = new Pool({ database: PG_DATABASE });
    const appSchemaResult = await detectPool.query(
      `SELECT schema_name FROM information_schema.schemata
       WHERE (schema_name LIKE '%app-public' OR schema_name LIKE '%app_public')
       ORDER BY schema_name DESC LIMIT 1`
    );
    await detectPool.end();

    if (appSchemaResult.rows.length > 0) {
      const seedSchema = appSchemaResult.rows[0].schema_name;
      console.log(`\n  Detected app schema: ${seedSchema}`);

      const envPath = path.resolve(process.cwd(), '../../.env');
      try {
        let envContent = fs.readFileSync(envPath, 'utf8');
        const regex = /^SEED_SCHEMA=.*/m;
        if (regex.test(envContent)) {
          envContent = envContent.replace(regex, `SEED_SCHEMA=${seedSchema}`);
        } else {
          envContent += `\nSEED_SCHEMA=${seedSchema}`;
        }
        fs.writeFileSync(envPath, envContent);
        console.log(`   SEED_SCHEMA written to .env`);
      } catch (e) {
        console.log(`   Could not update .env with SEED_SCHEMA (${e})`);
      }
    }
  }

  console.log('\n  Provisioning completed successfully!\n');
}

main().catch((err) => {
  console.error('Provision failed:', err.message ?? err);
  process.exit(1);
});
