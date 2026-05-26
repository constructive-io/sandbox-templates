/**
 * provision.ts — Post-creation setup for the constructive-app
 *
 * Reads DATABASE_ID, ACCESS_TOKEN, DATABASE_NAME from .env (set by create-db)
 * and:
 *   1. Attaches entity schemas to the app API
 *   2. Sets app membership defaults (auto-approve new users)
 *
 * Usage:  pnpm run provision
 */

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

  // -------------------------------------------------------------------------
  // Attach entity-related schemas to the 'app' API
  //
  // When a database is provisioned with modules (invites, memberships, etc.),
  // the platform creates schemas like {prefix}_public, {prefix}_memberships_public,
  // {prefix}_invites_public, etc. The app API (app-public-{dbName}.localhost) needs
  // these schemas attached so the app endpoint exposes the tables for codegen.
  // -------------------------------------------------------------------------
  console.log(`\n${'='.repeat(60)}`);
  console.log('  Attaching schemas to app API');
  console.log('='.repeat(60));

  const metaschemaClient = createMetaschemaClient();

  // Find the 'app' API for this database
  const apisResult = await withRetry(() =>
    metaschemaClient.api.findMany({
      where: { databaseId: { equalTo: config.databaseId }, name: { equalTo: 'app' } },
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

    // Attach all unattached schemas to the app API. We can't rely on suffix
    // matching (like '_public', '_memberships_public') because schema names
    // may include hashes when simple_schema_names is not set. Instead, attach
    // every schema that isn't already linked to the app API, excluding
    // internal/private schemas (metaschema, auth private, etc.).
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

  // -------------------------------------------------------------------------
  // Set app membership defaults so new users are auto-approved
  // -------------------------------------------------------------------------
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

  // Write SEED_SCHEMA to .env so seeding just works
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
