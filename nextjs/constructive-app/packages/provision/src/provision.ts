/**
 * provision.ts — Post-creation setup for the constructive-app
 *
 * Reads DATABASE_ID, ACCESS_TOKEN, DATABASE_NAME from .env (set by create-db)
 * and:
 *   1. Attaches entity schemas to the app API
 *   2. Grants users self-update (control-plane: AuthzDirectOwner self_update)
 *   3. Sets app membership defaults (auto-approve new users)
 *
 * App-table provisioning: the agent declares its own tables by calling
 * `provisionAppTable()` (a baked-in, owner-scoped blueprint helper — see below)
 * from this script after the schema-attach step. The helper already uses
 * object-form grants and the AuthzDirectOwner default, so a base auth:email app
 * doesn't have to re-derive the grant/policy shape on every build.
 *
 * Usage:  pnpm run provision
 */

import * as fs from 'fs';
import * as path from 'path';
import { Pool } from 'pg';

import { config } from './config.js';
import { withRetry, createMetaschemaClient, requireDatabaseId } from './helpers.js';

type MetaschemaClient = ReturnType<typeof createMetaschemaClient>;

const PG_DATABASE = config.pgInternalDatabase;

// ---------------------------------------------------------------------------
// PROVEN RECIPE (a): users-table self-update control-plane step
//
// The `users` table lives in the `users_public` schema, provisioned by the
// `users_module`. Out of the box it has no policy that lets an authenticated
// user UPDATE their own row, so account/profile edits (display name, etc.)
// fail RLS. This adds an owner-scoped self-update policy keyed on the row's own
// `id` — i.e. `auth.user_id() = users.id`.
//
// Expressed via createSecureTableProvision on the platform (metaschema)
// endpoint using the blueprint-style `policies` array the SDK accepts.
// ---------------------------------------------------------------------------
async function grantUsersSelfUpdate(client: MetaschemaClient): Promise<void> {
  console.log('\n  Granting users self-update (AuthzDirectOwner self_update)...');

  // Resolve the users_public schema for this database.
  const schemaResult = await withRetry(() =>
    client.schema.findMany({
      where: { databaseId: { equalTo: config.databaseId }, name: { equalTo: 'users_public' } },
      select: { id: true, name: true, schemaName: true },
    }).unwrap()
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const usersSchema = (schemaResult as any)?.schemas?.nodes?.[0];
  if (!usersSchema) {
    console.warn('   users_public schema not found — skipping self-update grant');
    return;
  }

  // Resolve the users table inside that schema.
  const tableResult = await withRetry(() =>
    client.table.findMany({
      where: {
        databaseId: { equalTo: config.databaseId },
        schemaId: { equalTo: usersSchema.id },
        name: { equalTo: 'users' },
      },
      select: { id: true, name: true },
    }).unwrap()
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const usersTable = (tableResult as any)?.tables?.nodes?.[0];
  if (!usersTable) {
    console.warn('   users table not found in users_public — skipping self-update grant');
    return;
  }

  try {
    await withRetry(() =>
      client.secureTableProvision.create({
        data: {
          databaseId: config.databaseId!,
          schemaId: usersSchema.id,
          tableId: usersTable.id,
          useRls: true,
          // AuthzDirectOwner / self_update on UPDATE, owner field = the row's own id.
          policies: [
            {
              $type: 'AuthzDirectOwner',
              permissive: true,
              privileges: ['update'],
              policy_name: 'self_update',
              data: { entity_field: 'id' },
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ] as any,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        select: { id: true } as any,
      }).unwrap()
    );
    console.log('   users.self_update policy applied (entity_field: id)');
  } catch (err: any) {
    if (err.message?.includes('already exists') || err.message?.includes('duplicate')) {
      console.log('   users.self_update policy already present');
    } else {
      console.warn(`   Could not apply users self-update policy: ${err.message}`);
    }
  }
}

// ---------------------------------------------------------------------------
// PROVEN RECIPE (b): app-table blueprint helper (object-form grants +
// AuthzDirectOwner owner-scoped default)
//
// Provisions a single app table via the server-side constructBlueprint
// mutation. Defaults are the proven shape so the agent only supplies the
// table name + fields:
//   - object-form grants: [{ roles: ['authenticated'], privileges: [...] }]
//   - AuthzDirectOwner owner-scoped policy (each user CRUDs their own rows).
//
// The agent calls this from main() for each app table, e.g.:
//   await provisionAppTable(metaschemaClient, {
//     tableName: 'todos',
//     fields: [
//       { name: 'title', type: 'text', is_required: true },
//       { name: 'is_done', type: 'boolean', default: 'false' },
//     ],
//   });
//
// For org-scoped (b2b) tables, pass policyType: 'AuthzEntityMembership' with
// data: { entity_field: 'entity_id', membership_type: 2 } and a
// DataOwnershipInEntity / DataEntityMembership node — but that is a b2b
// concern; a base auth:email app uses the AuthzDirectOwner default below.
// ---------------------------------------------------------------------------
export interface AppTableField {
  name: string;
  type: string;
  default?: string;
  is_required?: boolean;
  index?: boolean;
}

export interface AppTableSpec {
  tableName: string;
  fields?: AppTableField[];
  /** Defaults to owner-scoped: ['DataDirectOwner', 'DataTimestamps']. */
  nodes?: unknown[];
  /** Defaults to AuthzDirectOwner (owner CRUDs own rows). */
  policyType?: string;
  /** Defaults to { owner_field: 'owner_id' }. */
  policyData?: Record<string, unknown>;
  /** Defaults to full CRUD for 'authenticated'. */
  grants?: { roles: string[]; privileges: [string, string][] }[];
}

export async function provisionAppTable(
  client: MetaschemaClient,
  spec: AppTableSpec
): Promise<string> {
  // 1. Resolve the database owner_id (required on the blueprint record).
  const dbResult = await withRetry(() =>
    client.database.findOne({ id: requireDatabaseId(), select: { ownerId: true } }).unwrap()
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ownerId = (dbResult as any)?.database?.ownerId;
  if (!ownerId) throw new Error('Could not resolve database owner_id');

  // 2. Build the blueprint table with the proven owner-scoped defaults.
  const nodes = spec.nodes ?? ['DataDirectOwner', 'DataTimestamps'];
  // Object-form grants — the shape the platform validator expects.
  const grants = spec.grants ?? [
    {
      roles: ['authenticated'],
      privileges: [
        ['select', '*'],
        ['insert', '*'],
        ['update', '*'],
        ['delete', '*'],
      ] as [string, string][],
    },
  ];
  // AuthzDirectOwner owner-scoped default: every authenticated user CRUDs only
  // their own rows (matched on owner_id).
  const policies = [
    {
      $type: spec.policyType ?? 'AuthzDirectOwner',
      permissive: true,
      privileges: ['select', 'insert', 'update', 'delete'],
      data: spec.policyData ?? { owner_field: 'owner_id' },
    },
  ];

  const definition = {
    tables: [
      {
        table_name: spec.tableName,
        nodes,
        fields: spec.fields ?? [],
        grants,
        policies,
      },
    ],
    relations: [],
    indexes: [],
    full_text_searches: [],
  };

  // 3. Create the draft blueprint record.
  const blueprintName = `app_${spec.tableName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${Date.now()}`;
  const bpResult = await withRetry(() =>
    client.blueprint.create({
      data: {
        ownerId,
        databaseId: requireDatabaseId(),
        name: blueprintName,
        displayName: spec.tableName,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        definition: definition as any,
      },
      select: { id: true },
    }).unwrap()
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blueprintId = (bpResult as any)?.createBlueprint?.blueprint?.id;
  if (!blueprintId) throw new Error(`Failed to create blueprint record for ${spec.tableName}`);

  // 4. Execute all phases server-side in one transaction.
  const constructResult = await withRetry(() =>
    client.mutation.constructBlueprint(
      { input: { blueprintId } },
      { select: { result: true } }
    ).unwrap()
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const refMap = (constructResult as any)?.constructBlueprint?.result;
  if (!refMap) {
    throw new Error(`constructBlueprint failed for ${spec.tableName} — check blueprint_construction status`);
  }
  console.log(`   Provisioned app table: ${spec.tableName}`);
  return blueprintId;
}

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
  // PROVEN RECIPE (a): grant users self-update so account/profile edits pass RLS
  // -------------------------------------------------------------------------
  await grantUsersSelfUpdate(metaschemaClient);

  // -------------------------------------------------------------------------
  // App tables: declare them here via provisionAppTable(metaschemaClient, ...).
  // The base scaffold ships a `todos` table; add your own following the same
  // owner-scoped pattern. (Left as an explicit, easy-to-find seam rather than a
  // hidden default so the agent provisions exactly the tables its app needs.)
  //
  //   await provisionAppTable(metaschemaClient, {
  //     tableName: 'todos',
  //     fields: [
  //       { name: 'title', type: 'text', is_required: true },
  //       { name: 'is_done', type: 'boolean', default: 'false' },
  //     ],
  //   });
  // -------------------------------------------------------------------------

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
