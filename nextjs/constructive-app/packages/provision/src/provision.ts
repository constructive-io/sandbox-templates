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
import {
  withRetry,
  createMetaschemaClient,
  createModulesClient,
  resolvePhysicalSchemaName,
  requireDatabaseId,
} from './helpers.js';

// `read` client = api.localhost (apis/schemas/tables/databases + createApiSchema).
// `modules` client = modules.localhost (blueprint / constructBlueprint /
// secureTableProvision). The two hosts expose disjoint type sets, so each call
// MUST go to the right one.
type MetaschemaClient = ReturnType<typeof createMetaschemaClient>;
type ModulesClient = ReturnType<typeof createModulesClient>;

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
async function grantUsersSelfUpdate(
  readClient: MetaschemaClient,
  modulesClient: ModulesClient
): Promise<void> {
  console.log('\n  Granting users self-update (AuthzDirectOwner self_update)...');

  // Resolve the users_public schema for this database (READ — api host).
  const schemaResult = await withRetry(() =>
    readClient.schema.findMany({
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

  // Resolve the users table inside that schema (READ — api host).
  const tableResult = await withRetry(() =>
    readClient.table.findMany({
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
      // createSecureTableProvision lives on the MODULES host.
      modulesClient.secureTableProvision.create({
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
/**
 * Author-facing field spec. The agent writes the ergonomic bare-string form
 * (`type: 'text'`, `default: 'false'`); provisionAppTable converts it to the
 * OBJECT shapes the blueprint validator requires before sending:
 *   - FieldType:    { name: 'text' }                     (NOT the bare string 'text')
 *   - FieldDefault: { value: false } | { value: 'foo' }  (discriminated union)
 * Passing bare strings makes constructBlueprint fail with BAD_FIELD_INPUT and the
 * table is never created. You may also pass the object forms directly to escape
 * the convenience mapping (e.g. a function default `{ function: 'now' }`).
 */
export interface AppTableField {
  name: string;
  /** Bare SQL type ('text','boolean',...) or a full FieldType object ({ name, args?, ... }). */
  type: string | Record<string, unknown>;
  /** Literal ('false','hello'), or a FieldDefault object ({ value }, { function }, ...). */
  default?: string | number | boolean | Record<string, unknown>;
  is_required?: boolean;
  index?: boolean;
}

export interface AppTableSpec {
  tableName: string;
  fields?: AppTableField[];
  /**
   * Defaults to owner-scoped with a PK: ['DataId', 'DataDirectOwner', 'DataTimestamps'].
   * DataId MUST come first — it creates the UUID primary key. Without a PK the
   * table has no id column, so per-row UPDATE/DELETE (and owner RLS) can't target rows.
   */
  nodes?: unknown[];
  /** Defaults to AuthzDirectOwner (owner CRUDs own rows). */
  policyType?: string;
  /** Defaults to { entity_field: 'owner_id' } — the key AuthzDirectOwner reads. */
  policyData?: Record<string, unknown>;
  /** Defaults to full CRUD for 'authenticated'. */
  grants?: { roles: string[]; privileges: [string, string][] }[];
}

/** Coerce an author field type (bare string or object) into a FieldType object: { name, ... }. */
function toFieldType(type: string | Record<string, unknown>): Record<string, unknown> {
  return typeof type === 'string' ? { name: type } : type;
}

/** Coerce an author default (literal or object) into a FieldDefault object: { value } | passthrough. */
function toFieldDefault(
  def: string | number | boolean | Record<string, unknown>
): Record<string, unknown> {
  return typeof def === 'object' && def !== null ? def : { value: def };
}

export async function provisionAppTable(
  readClient: MetaschemaClient,
  modulesClient: ModulesClient,
  spec: AppTableSpec
): Promise<string> {
  // 1. Resolve the database owner_id (READ — api host; `database` is not on modules).
  const dbResult = await withRetry(() =>
    readClient.database.findOne({ id: requireDatabaseId(), select: { ownerId: true } }).unwrap()
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ownerId = (dbResult as any)?.database?.ownerId;
  if (!ownerId) throw new Error('Could not resolve database owner_id');

  // 2. Build the blueprint table with the proven owner-scoped defaults.
  // DataId FIRST so the table gets a UUID primary key — without it there is no
  // id column and per-row update/delete + owner RLS have nothing to target.
  const nodes = spec.nodes ?? ['DataId', 'DataDirectOwner', 'DataTimestamps'];
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
  // their own rows, matched on owner_id. The policy reads `data.entity_field`
  // (NOT owner_field) — owner_field is silently ignored, leaving the table
  // effectively locked.
  const policies = [
    {
      $type: spec.policyType ?? 'AuthzDirectOwner',
      permissive: true,
      privileges: ['select', 'insert', 'update', 'delete'],
      data: spec.policyData ?? { entity_field: 'owner_id' },
    },
  ];

  // Convert author field specs to the validator's OBJECT shapes:
  //   type -> { name: 'text' }, default -> { value: false }.
  const fields = (spec.fields ?? []).map((f) => {
    const out: Record<string, unknown> = { name: f.name, type: toFieldType(f.type) };
    if (f.default !== undefined) out.default = toFieldDefault(f.default);
    if (f.is_required !== undefined) out.is_required = f.is_required;
    if (f.index !== undefined) out.index = f.index;
    return out;
  });

  const definition = {
    tables: [
      {
        table_name: spec.tableName,
        nodes,
        fields,
        grants,
        policies,
      },
    ],
    relations: [],
    indexes: [],
    full_text_searches: [],
  };

  // 3. Create the draft blueprint record (MUTATION — modules host).
  const blueprintName = `app_${spec.tableName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${Date.now()}`;
  const bpResult = await withRetry(() =>
    modulesClient.blueprint.create({
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

  // 4. Execute all phases server-side in one transaction (MUTATION — modules host).
  const constructResult = await withRetry(() =>
    modulesClient.mutation.constructBlueprint(
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
  // Attach entity-related schemas to the app-data API
  //
  // When a database is provisioned with modules (invites, memberships, etc.),
  // the platform creates schemas like {prefix}_public, {prefix}_memberships_public,
  // {prefix}_invites_public, etc. The app-data API (served on api-{dbName}.localhost,
  // named 'api' in services_public.apis — NOT 'app') needs these schemas attached
  // so the endpoint exposes the tables for codegen.
  //
  // NOTE: constructBlueprint already auto-attaches each new app table's schema to
  // the 'api' API, so this step is a best-effort top-up for module schemas — it is
  // non-fatal and fully idempotent.
  // -------------------------------------------------------------------------
  console.log(`\n${'='.repeat(60)}`);
  console.log('  Attaching schemas to app-data API (api-' + config.databaseName + ')');
  console.log('='.repeat(60));

  // READ client (api.localhost) for apis/schemas/tables + createApiSchema.
  const metaschemaClient = createMetaschemaClient();
  // MUTATION client (modules.localhost) for blueprint / constructBlueprint / secureTableProvision.
  const modulesClient = createModulesClient();

  // Find the app-data API for this database. The hub's base provisioning names it
  // 'api' (services_public.apis ... name = 'api'); the earlier 'app' lookup never
  // matched, so the schema-attach + table seam silently no-op'd.
  const apisResult = await withRetry(() =>
    metaschemaClient.api.findMany({
      where: { databaseId: { equalTo: config.databaseId }, name: { equalTo: 'api' } },
      select: { id: true, name: true, apiSchemas: { select: { id: true, schema: { select: { id: true, name: true, schemaName: true } } } } },
    }).unwrap()
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const appApi = (apisResult as any)?.apis?.nodes?.[0];
  if (!appApi) {
    console.warn("   'api' app-data API not found — skipping schema attachment (constructBlueprint auto-attaches anyway)");
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
  // (READS via api host, secureTableProvision via modules host)
  // -------------------------------------------------------------------------
  await grantUsersSelfUpdate(metaschemaClient, modulesClient);

  // -------------------------------------------------------------------------
  // App tables: declare them here via provisionAppTable(read, modules, spec).
  // The base scaffold ships a `todos` table (owner-scoped: each user CRUDs only
  // their own rows). Add your own following the same pattern. Author fields in
  // the ergonomic bare-string form — provisionAppTable converts type/default to
  // the FieldType/FieldDefault objects the blueprint validator requires.
  // -------------------------------------------------------------------------
  await provisionAppTable(metaschemaClient, modulesClient, {
    tableName: 'todos',
    fields: [
      { name: 'title', type: 'text', is_required: true },
      { name: 'is_done', type: 'boolean', default: false },
    ],
  });

  // -------------------------------------------------------------------------
  // Set app membership defaults so new users are auto-approved.
  // Anchor to THIS tenant's physical memberships schema (resolved by database_id
  // via the metaschema) — a floating `LIKE '%memberships_public' DESC LIMIT 1`
  // has no db filter and on a shared hub would mutate a SIBLING tenant.
  // -------------------------------------------------------------------------
  if (pgAvailable) {
    console.log('\n  Setting membership defaults...');
    const membershipsSchema = await resolvePhysicalSchemaName(config.databaseId!, 'memberships_public');
    if (membershipsSchema) {
      const defaultsPool = new Pool({ database: PG_DATABASE });
      await defaultsPool.query(
        `UPDATE "${membershipsSchema}".app_membership_defaults
         SET is_approved = TRUE, is_verified = TRUE`
      );
      await defaultsPool.end();
      console.log(`   schema: ${membershipsSchema} (this tenant)`);
      console.log('   is_approved = TRUE, is_verified = TRUE');
    } else {
      console.log('   No memberships_public schema for this tenant - skipping defaults');
    }
  }

  // Write SEED_SCHEMA to .env so seeding just works.
  // Resolve THIS tenant's physical app schema (logical name 'app_public') via the
  // metaschema, NOT a floating LIKE that could pick a sibling tenant's app schema.
  if (pgAvailable) {
    const seedSchema = await resolvePhysicalSchemaName(config.databaseId!, 'app_public');

    if (seedSchema) {
      console.log(`\n  Detected app schema (this tenant): ${seedSchema}`);

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
