/**
 * create-db.ts — Create a new myapp database
 *
 * Signs up a new admin user, provisions a database via the Constructive
 * platform API, and writes credentials to .env for subsequent use by
 * the provision scripts.
 *
 * Usage:  pnpm run create-db
 */

import { auth, NodeHttpAdapter, public_ } from '@constructive-io/node';
import { createFetch } from '@constructive-io/fetch';

import { asModules, AUTH_HARDENED_MODULES, ORG_MODULES, type ProvisionModule } from './modules.js';

// B2B tier: auth:hardened + org modules (organizations, members, invites, settings).
// The recovered org pages + feature pack integration require these modules.
const APP_MODULES: ProvisionModule[] = [...AUTH_HARDENED_MODULES, ...ORG_MODULES];
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';

import { config } from './config.js';
import { withRetry } from './helpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const databaseName = config.databaseName || 'myapp';
  const adminEmail = config.adminEmail;

  console.log('\n  Constructive App — Create Database\n');
  console.log(`   Database:  ${databaseName}`);
  console.log(`   Admin:     ${adminEmail}`);

  // --- Pre-flight: GraphQL server must be reachable ---
  // The create-db flow depends on the auth endpoint to sign up
  // the admin and on modules.localhost:3000 to provision modules.
  // If neither responds, signUp and provisionDatabase hang or fail in
  // confusing ways. Fail fast with a clear, actionable message.
  const authEndpoint = config.authEndpoint;
  // Probe the auth endpoint directly — the server returns 404 for the
  // bare host (e.g. http://auth.localhost:3000) but 200 for /graphql.
  try {
    const probeRes = await fetch(authEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '{__typename}' }),
      signal: AbortSignal.timeout(3000),
    });
    if (!probeRes.ok && probeRes.status !== 400) {
      // 400 = GraphQL endpoint is up but rejected the bare query — that's fine,
      // it means the server is reachable.
      throw new Error(`HTTP ${probeRes.status}`);
    }
    console.log(`   Pre-flight OK: ${authEndpoint} reachable`);
  } catch (err: any) {
    console.error(`\n   !! Pre-flight FAILED: GraphQL server is not responding at ${authEndpoint}`);
    console.error(`   !! (${err.message?.split('\n')[0] ?? err})`);
    console.error(`   !!`);
    console.error(`   !! Start the GraphQL server in a separate terminal:`);
    console.error(`   !!`);
    console.error(`   !!   cd constructive/graphql/server && PGDATABASE=${config.pgInternalDatabase} pnpm dev`);
    console.error(`   !!`);
    console.error(`   !! (or: PGDATABASE=${config.pgInternalDatabase} cnc server --port 3000 --origin "*")`);
    console.error(`   !!`);
    console.error(`   !! Then re-run: pnpm run create-db\n`);
    process.exit(1);
  }

  // --- Step 0: Set server-level schema naming strategy ---
  const pgAvailable = !!process.env.PGHOST;
  if (pgAvailable) {
    console.log('\n   Setting server-level schema naming strategy...');
    const sysPool = new Pool();
    await sysPool.query(`ALTER SYSTEM SET constructive.simple_schema_names = 'true'`);
    await sysPool.query(`ALTER SYSTEM SET constructive.schema_use_underscores = 'true'`);
    await sysPool.query(`SELECT pg_reload_conf()`);
    await sysPool.end();
    console.log('   constructive.simple_schema_names = true (server-level)');
    console.log('   constructive.schema_use_underscores = true (server-level)');
  } else {
    console.log('\n   PGHOST not set — skipping server-level schema naming settings.');
    console.log('   Run: eval "$(pgpm env)" before creating the database.');
  }

  // --- Step 1: Sign up (or sign in if user already exists) ---

  const authClient = auth.createClient({
    adapter: new NodeHttpAdapter(config.authEndpoint, {
      'X-Meta-Schema': 'true',
      'X-Schemata': 'constructive_auth_public',
    }),
  });

  let userId: string | undefined;
  let accessToken: string | undefined;

  // sign_up never signs anyone in (and answers the same for a taken address);
  // sign in with the password just set.
  await authClient.mutation
    .signUp(
      { input: { email: adminEmail, password: config.adminPassword } },
      { select: { clientMutationId: true } }
    )
    .unwrap();
  const signInData = await authClient.mutation
    .signIn(
      { input: { email: adminEmail, password: config.adminPassword } },
      { select: { result: { select: { userId: true, accessToken: true } } } }
    )
    .unwrap();
  userId = (signInData as Record<string, Record<string, Record<string, string>>>)
    ?.signIn?.result?.userId;
  accessToken = (signInData as Record<string, Record<string, Record<string, string>>>)
    ?.signIn?.result?.accessToken;

  if (!accessToken || !userId) {
    console.error('No token/userId returned from signIn');
    process.exit(1);
  }
  console.log(`   Signed up (ID: ${userId})`);

  // --- Step 1.5: Bootstrap modules API and domain (SQL — one-time setup) ---
  // The modules API (anonRole='administrator') and modules.localhost domain are
  // required for Step 2 (databaseProvisionModule). We MUST create them via SQL
  // because the GraphQL API (api.localhost) has anon_role='anonymous' and the
  // opaque cnc_live_* tokens can't be decoded as JWTs by PostGraphile — so we
  // have no way to authenticate as administrator through the GraphQL layer.
  //
  // This is the same bootstrap that the hub's admin server provides out-of-box
  // (via API_ANON_ROLE='administrator'). On a single-server local setup we
  // create the equivalent via SQL.
  console.log('\n   Bootstrapping modules API and domain (SQL)...');
  if (pgAvailable) {
    try {
      const bootstrapPool = new Pool({ database: config.pgInternalDatabase });
      try {
        // Find the platform database ID (all existing APIs share this)
        const dbRes = await bootstrapPool.query(
          `SELECT DISTINCT database_id FROM routing_public.apis LIMIT 1`
        );
        const platformDbId: string = dbRes.rows[0]?.database_id;
        if (!platformDbId) {
          console.warn('   No existing APIs found — cannot determine platform database ID');
        } else {
          // Create the modules API with administrator role.
          // NOTE: dbname must be the PHYSICAL database (constructive) — the
          // server's buildLoaderContext connects a tenantPool with row.dbname;
          // a logical tenant name here 404s the whole API at runtime.
          const apiRes = await bootstrapPool.query(
            `INSERT INTO routing_public.apis (database_id, name, dbname, anon_role, role_name, is_published)
             VALUES ($1, 'modules', $2, 'administrator', 'administrator', true)
             ON CONFLICT DO NOTHING
             RETURNING id`,
            [platformDbId, config.pgInternalDatabase]
          );
          if (apiRes.rows.length > 0) {
            console.log('   Created modules API (anonRole=administrator)');
          } else {
            // Already exists — ensure role is correct
            await bootstrapPool.query(
              `UPDATE routing_public.apis SET anon_role = 'administrator', role_name = 'administrator'
               WHERE name = 'modules' AND database_id = $1 AND anon_role != 'administrator'`,
              [platformDbId]
            );
            console.log('   modules API already exists');
          }

          // Create the modules.localhost domain
          await bootstrapPool.query(
            `INSERT INTO routing_public.domains (database_id, hostname)
             SELECT $1, 'modules.localhost'
             WHERE NOT EXISTS (
               SELECT 1 FROM routing_public.domains
               WHERE hostname = 'modules.localhost' AND database_id = $1
             )
             ON CONFLICT DO NOTHING`,
            [platformDbId]
          );

          // Create route from modules.localhost domain to modules API
          await bootstrapPool.query(
            `INSERT INTO routing_public.routes (database_id, domain_id, target_api_id)
             SELECT $1, d.id, a.id
             FROM routing_public.domains d, routing_public.apis a
             WHERE d.hostname = 'modules.localhost' AND d.database_id = $1
               AND a.name = 'modules' AND a.database_id = $1
               AND NOT EXISTS (
                 SELECT 1 FROM routing_public.routes r
                 WHERE r.domain_id = d.id AND r.target_api_id = a.id
               )
             ON CONFLICT DO NOTHING`,
            [platformDbId]
          );

          // Attach required schemas (metaschema_modules_public, metaschema_public, routing_public)
          await bootstrapPool.query(
            `INSERT INTO routing_public.api_schemas (database_id, api_id, schema_id)
             SELECT $1, a.id, s.id
             FROM routing_public.apis a, metaschema_public.schema s
             WHERE a.name = 'modules' AND a.database_id = $1
               AND s.database_id = $1
               AND s.schema_name IN ('metaschema_modules_public', 'metaschema_public', 'routing_public')
               AND NOT EXISTS (
                 SELECT 1 FROM routing_public.api_schemas AS existing
                 WHERE existing.api_id = a.id AND existing.schema_id = s.id
               )
             ON CONFLICT DO NOTHING`,
            [platformDbId]
          );

          console.log('   Modules API, domain, and schemas are ready');
        }
      } finally {
        await bootstrapPool.end();
      }

      // Flush the server cache so it picks up the new domain/API
      try {
        const fetchFn = createFetch();
        const flushRes = await fetchFn('http://modules.localhost:3000/flush', { method: 'POST' });
        if (flushRes.ok) console.log('   modules.localhost cache flushed');
      } catch {
        // Server might not be running — it'll pick up the domain on restart
      }
    } catch (err: any) {
      console.warn(`   SQL bootstrap failed: ${err.message?.split('\n')[0]}`);
      console.warn('   modules.localhost may not work. Restart the server if it returns 404.');
    }
  } else {
    console.warn('   PGHOST not set — skipping modules API bootstrap.');
    console.warn('   Run: eval "$(pgpm env)" before create-db.');
  }

  // --- Step 2: Provision database ---
  // The databaseProvisionModule mutation was moved from the "api" endpoint
  // to the "modules" endpoint in the 2025-05 upstream refactor.
  // We point public_.createClient() at the modules endpoint — the SDK
  // still has the databaseProvisionModule model, it just lives on a
  // different subdomain now.

  console.log('\n   Provisioning database...');
  const modulesClient = public_.createClient({
    adapter: new NodeHttpAdapter(config.modulesEndpoint, {
      Authorization: `Bearer ${accessToken}`,
      'X-Meta-Schema': 'true',
    }),
  });

  const provData = await withRetry(() =>
    modulesClient.databaseProvisionModule
      .create({
        data: {
          databaseName,
          // ownerId is set to the admin's personal user ID (type=1 person).
          // This satisfies the FK on metaschema_public.database.owner_id and
          // bootstrap_owner_into_database (which creates app_memberships).
          ownerId: userId,
          subdomain: databaseName,
          domain: 'localhost',
          modules: asModules(APP_MODULES),
          bootstrapUser: true,
          options: {}
        },
        select: { id: true, databaseId: true, errorMessage: true }
      })
      .unwrap()
  );

  const dbProv = (provData as Record<string, Record<string, Record<string, string | null>>>)
    ?.createDatabaseProvisionModule?.databaseProvisionModule;

  let databaseId: string;
  if (!dbProv || !dbProv.databaseId) {
    const errMsg = dbProv?.errorMessage || 'unknown';
    if (errMsg.includes('duplicate') || errMsg.includes('already exists') || errMsg.includes('unique constraint')) {
      // Database already provisioned — use DATABASE_ID from .env
      console.log('   Database already provisioned — using DATABASE_ID from .env');
      databaseId = config.databaseId!;
      if (!databaseId) {
        console.error('   Could not find existing database ID. Set DATABASE_ID in .env manually.');
        process.exit(1);
      }
      console.log(`   Database exists (ID: ${databaseId})`);
    } else {
      console.error(`DB Provision failed: ${errMsg}`);
      process.exit(1);
    }
  } else {
    databaseId = dbProv.databaseId;
    console.log(`   Database ready (ID: ${databaseId})`);
  }

  // --- Step 2.1: Create migrate API row (SQL — uses databaseId from Step 2) ---
  // The migrate API is needed by provision.ts for export. It must be created
  // via SQL (superuser) because INSERT on routing_public.apis is blocked by
  // RLS for authenticated users. We do this AFTER Step 2 because we need
  // the correct databaseId (the tenant DB, not the platform DB).
  if (pgAvailable && databaseId) {
    try {
      const migratePool = new Pool({ database: config.pgInternalDatabase });
      try {
        // NOTE: dbname must be the PHYSICAL database (constructive) — the
        // server's buildLoaderContext connects a tenantPool with row.dbname;
        // a logical tenant name here 404s the whole API at runtime.
        const migrateRes = await migratePool.query(
          `INSERT INTO routing_public.apis (database_id, name, dbname, anon_role, role_name, is_published)
           VALUES ($1, 'migrate', $2, 'anonymous', 'authenticated', true)
           ON CONFLICT (database_id, name) DO NOTHING
           RETURNING id`,
          [databaseId, config.pgInternalDatabase]
        );
        if (migrateRes.rows.length > 0) {
          console.log('   Created migrate API (roleName=authenticated)');
        } else {
          // Already exists — ensure database_id, physical dbname, and role are
          // correct (self-heals rows written with a logical tenant dbname)
          await migratePool.query(
            `UPDATE routing_public.apis
             SET dbname = $2, anon_role = 'anonymous', role_name = 'authenticated', is_published = true
             WHERE name = 'migrate' AND database_id = $1`,
            [databaseId, config.pgInternalDatabase]
          );
          console.log('   migrate API already exists (ensured correct database_id)');
        }
      } finally {
        await migratePool.end();
      }
    } catch (err: any) {
      console.warn(`   Migrate API creation failed: ${err.message?.split('\n')[0]}`);
    }
  }

  // --- Step 2.5: Database-level settings (only if the tenant is a real PG DB) ---
  // Under schema-based tenancy (the default local setup) the tenant has no
  // physical database — its schemas live inside the platform DB — so there is
  // nothing to ALTER and the server-level settings from Step 0 cover it.
  if (pgAvailable) {
    try {
      const settingsPool = new Pool({ database: config.pgInternalDatabase });
      const dbExists = await settingsPool.query(
        `SELECT 1 FROM pg_database WHERE datname = $1`,
        [databaseName]
      );
      if (dbExists.rows.length === 0) {
        console.log('   Tenant is schema-based (no physical DB) — server-level settings from Step 0 apply.');
      } else {
        await settingsPool.query(`ALTER DATABASE "${databaseName}" SET constructive.simple_schema_names = 'true'`);
        await settingsPool.query(`ALTER DATABASE "${databaseName}" SET constructive.schema_use_underscores = 'true'`);
        console.log('   constructive.simple_schema_names = true (database-level)');
        console.log('   constructive.schema_use_underscores = true (database-level)');
      }
      await settingsPool.end();
    } catch (err: any) {
      console.log(`   Database-level settings skipped (${err.message?.split('\n')[0]})`);
      console.log('   Server-level settings from Step 0 are sufficient.');
    }
  }

  // --- Step 2.6: Ensure admin user is in tenant users table (bootstrap fallback) ---
  // The platform's bootstrap_owner_into_database() should populate
  // {db}_users_public.users with the admin, but bootstrapUser:true can fail
  // silently when the source user is created in the same transaction or via
  // an anon-role proxy. Doing it here means subsequent steps (db-scoped auth,
  // permissions grant) see a consistent state immediately.
  if (pgAvailable && userId) {
    try {
      const bootstrapFallbackPool = new Pool({ database: config.pgInternalDatabase });
      try {
        const v_users_schema = `${databaseName.replace(/-/g, '_')}_users_public`;
        // Check if admin row exists
        const existingRes = await bootstrapFallbackPool.query(
          `SELECT id FROM "${v_users_schema}".users WHERE id = $1`,
          [userId]
        );
        if (existingRes.rowCount === 0) {
          // Try to copy from platform schema first
          const copied = await bootstrapFallbackPool.query(
            `INSERT INTO "${v_users_schema}".users (id, username, display_name, type)
             SELECT $1, u.username, u.display_name, u.type
             FROM constructive_users_public.users u
             WHERE u.id = $1
             ON CONFLICT (id) DO NOTHING
             RETURNING id`,
            [userId]
          );
          if (copied.rowCount && copied.rowCount > 0) {
            console.log(`   Bootstrap fallback: copied admin ${userId} from constructive_users_public.users`);
          } else {
            // No platform row to copy from — insert a stub.
            // The signUp step created the user via the auth endpoint; we don't
            // have the username here. Use the email prefix as a placeholder;
            // the seed script will reconcile details.
            const stubUsername = adminEmail.split('@')[0] || 'admin';
            const inserted = await bootstrapFallbackPool.query(
              `INSERT INTO "${v_users_schema}".users (id, username, display_name, type)
               VALUES ($1, $2, $3, 1)
               ON CONFLICT (id) DO NOTHING
               RETURNING id`,
              [userId, stubUsername, stubUsername]
            );
            if (inserted.rowCount && inserted.rowCount > 0) {
              console.log(`   Bootstrap fallback: inserted stub admin ${userId} into ${v_users_schema}.users`);
            } else {
              console.log(`   Bootstrap fallback: admin row already exists (raced)`);
            }
          }
        } else {
          console.log(`   Bootstrap fallback: admin row already present in ${v_users_schema}.users`);
        }
      } finally {
        await bootstrapFallbackPool.end();
      }
    } catch (err: any) {
      // Best-effort only — log and continue.
      console.log(`   Bootstrap fallback skipped: ${err.message?.split('\n')[0]}`);
    }
  }

  // --- Step 3: Register admin at db-scoped auth level ---
  // The platform uses separate auth schemas per database (constructive_auth_private
  // vs myapp_auth_private). Step 1 registered the admin at the platform level;
  // now register at the db-scoped level so the seed script can sign in.

  console.log('\n   Registering admin at db-scoped auth level...');
  const dbAuthEndpoint = `http://auth-${databaseName}.localhost:3000/graphql`;
  const dbAuthClient = auth.createClient({
    adapter: new NodeHttpAdapter(dbAuthEndpoint),
  });

  let dbAdminUserId: string | undefined;
  try {
    const dbSignUpData = await dbAuthClient.mutation
      .signUp(
        { input: { email: adminEmail, password: config.adminPassword } },
        { select: { result: { select: { userId: true, accessToken: true } } } }
      )
      .unwrap();
    dbAdminUserId = (dbSignUpData as Record<string, Record<string, Record<string, string>>>)
      ?.signUp?.result?.userId;
    console.log(`   Registered (${dbAdminUserId})`);
  } catch (err: any) {
    if (err.message?.includes('ACCOUNT_EXISTS')) {
      console.log('   Already exists — signing in');
      const dbSignInData = await dbAuthClient.mutation
        .signIn(
          { input: { email: adminEmail, password: config.adminPassword } },
          { select: { result: { select: { userId: true, accessToken: true } } } }
        )
        .unwrap();
      dbAdminUserId = (dbSignInData as Record<string, Record<string, Record<string, string>>>)
        ?.signIn?.result?.userId;
      console.log(`   Signed in (${dbAdminUserId})`);
    } else {
      console.warn(`   Could not register db-scoped admin: ${err.message}`);
    }
  }

  // Grant full permissions so the admin can manage the app.
  // The INSERT policies on tenant tables require specific
  // permission bits in app_memberships_sprt, which default to all zeros.
  //
  // Also grant org-level permissions if org_memberships tables exist
  // (B2B opt-in) — RLS policies on routing_public tables check
  // manage_services permission via org membership.
  let permissionsGranted = false;
  if (dbAdminUserId && pgAvailable) {
    try {
      // Schema-based tenancy: the membership schemas ({tenant}_memberships_public)
      // live inside the physical platform DB, so connect to
      // config.pgInternalDatabase — NOT to a per-tenant database (none exists).
      const permPool = new Pool({ database: config.pgInternalDatabase });
      // Find ALL memberships_public schemas for this tenant
      // (both app_memberships and org_memberships)
      const schemaResult = await permPool.query(
        `SELECT schema_name FROM information_schema.schemata
         WHERE schema_name LIKE '%memberships_public'
         AND schema_name LIKE '${databaseName}%'
         ORDER BY schema_name`
      );
      console.log(`   Found ${schemaResult.rows.length} membership schemas:`,
        schemaResult.rows.map((r: any) => r.schema_name).join(', ') || '(none)');

      const ALL_PERMS = '1111111111111111111111111111111111111111111111111111111111111111';

      for (const { schema_name: membershipsSchema } of schemaResult.rows) {
        // Update app_memberships — grants app-scoped permissions
        try {
          const appResult = await permPool.query(
            `UPDATE "${membershipsSchema}".app_memberships
             SET is_admin = true, is_owner = true, permissions = $2::bit(64)
             WHERE actor_id = $1`,
            [dbAdminUserId, ALL_PERMS]
          );
          if (appResult.rowCount && appResult.rowCount > 0) {
            console.log(`   ${membershipsSchema}.app_memberships: ${appResult.rowCount} row(s) updated`);
          }
        } catch {
          // app_memberships may not exist in all membership schemas
        }

        // Update org_memberships — grants org-scoped permissions
        // (manage_services bit 13, manage_database bit 12, manage_sites bit 14, etc.)
        // Only present when org modules are provisioned (B2B opt-in).
        try {
          const orgResult = await permPool.query(
            `UPDATE "${membershipsSchema}".org_memberships
             SET is_admin = true, is_owner = true, permissions = $2::bit(64)
             WHERE actor_id = $1`,
            [dbAdminUserId, ALL_PERMS]
          );
          if (orgResult.rowCount && orgResult.rowCount > 0) {
            console.log(`   ${membershipsSchema}.org_memberships: ${orgResult.rowCount} row(s) updated`);
          }
        } catch {
          // org_memberships may not exist in all membership schemas
        }
      }

      permissionsGranted = true;
      await permPool.end();
    } catch (err: any) {
      console.warn(`   SQL permission grant failed: ${err.message?.split('\n')[0]}`);
    }
  }

  // Fallback: grant via admin GraphQL API
  if (dbAdminUserId && !permissionsGranted) {
    try {
      const adminEndpoint = `http://admin-${databaseName}.localhost:3000/graphql`;
      const dbSignInData = await dbAuthClient.mutation
        .signIn(
          { input: { email: adminEmail, password: config.adminPassword } },
          { select: { result: { select: { accessToken: true } } } }
        )
        .unwrap();
      const dbAccessToken = (dbSignInData as Record<string, Record<string, Record<string, string>>>)
        ?.signIn?.result?.accessToken;

      if (dbAccessToken) {
        const adminClient = public_.createClient({
          adapter: new NodeHttpAdapter(adminEndpoint, { Authorization: `Bearer ${dbAccessToken}` }),
        });

        // Update auto-created app membership
        const membershipResult = await adminClient.appMembership.findMany({
          where: { actorId: { equalTo: dbAdminUserId } },
          select: { id: true },
        }).unwrap();
        const membershipId = (membershipResult as any)?.appMemberships?.nodes?.[0]?.id;

        if (membershipId) {
          // Column-level GRANTs only allow UPDATE on:
          //   is_banned, is_approved, is_verified, is_disabled, granted
          await adminClient.appMembership.update({
            where: { id: membershipId },
            data: {
              isApproved: true,
              isVerified: true,
            },
            select: { id: true },
          }).unwrap();
          console.log('   Admin membership approved (GraphQL)');
        } else {
          console.warn('   No app membership found for admin — skipping permission grant');
        }
      }
    } catch (err: any) {
      console.warn(`   Could not grant permissions via GraphQL: ${err.message}`);
      console.warn('   You may need to run: eval "$(pgpm env)" && pnpm run create-db');
    }
  }

  // --- Step 4: Write .env ---

  const envPath = path.resolve(__dirname, '../../../.env');
  console.log(`\n   Writing credentials to ${envPath}`);

  let envContent = '';
  try {
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
  } catch {
    // File doesn't exist yet — that's fine
  }

  const newVars: Record<string, string> = {
    DATABASE_ID: databaseId,
    DATABASE_NAME: databaseName,
    ACCESS_TOKEN: accessToken,
    PGDATABASE: config.pgInternalDatabase,
    NEXT_PUBLIC_DB_NAME: databaseName,
  };

  let content = envContent;
  for (const [key, val] of Object.entries(newVars)) {
    const regex = new RegExp(`^${key}=.*`, 'm');
    if (regex.test(content)) {
      content = content.replace(regex, `${key}=${val}`);
    } else {
      content += `\n${key}=${val}`;
    }
  }

  fs.writeFileSync(envPath, content.trim() + '\n');
  console.log('   .env updated');

  console.log('\n  Database created. Run `pnpm run provision` to apply schemas.\n');
}

main().catch((err) => {
  console.error('create-db failed:', err.message ?? err);
  process.exit(1);
});
