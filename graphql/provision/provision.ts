#!/usr/bin/env ts-node
/**
 * Constructive App Provisioning Script
 *
 * Reads provision.config.ts and executes SDK calls to:
 * 1. Sign up / sign in on platform auth
 * 2. Create database with modules
 * 3. Apply post-provisioning workarounds (email verification, membership defaults)
 * 4. Sign in to per-database auth
 * 5. Create secured tables with grants and composed modules
 * 6. Create relations between tables
 *
 * Output: JSON result to stdout for run-state.json consumption.
 *
 * Usage:
 *   pnpm provision
 */

import { auth, public_ as platform, NodeHttpAdapter } from '@constructive-io/node';
import { Client as PgClient } from 'pg';
import config from './provision.config';

interface ProvisionResult {
  database: { name: string; id: string; schemaPrefix: string };
  auth: { platformUserId: string; platformTokenRef: string; perDbTokenRef: string };
  tables: { name: string; tableId: string }[];
  relations: string[];
}

// ---------------------------------------------------------------------------
// Internal compatibility shim for granteeName vs roleName
// ---------------------------------------------------------------------------
// Some SDK versions use `roleName` while others use `granteeName` for grant
// targets in secureTableProvision. This shim tries the standard API first,
// then falls back to the low-level ORM if the field name is rejected.
// Consumers of this template never see this — they just provide
// grantRoles/grantPrivileges in their config.
// ---------------------------------------------------------------------------
async function createSecuredTableWithShim(
  apiClient: ReturnType<typeof platform.createClient>,
  databaseId: string,
  tableDef: typeof config.tables[number],
): Promise<{ name: string; tableId: string }> {
  const grantPrivileges = tableDef.grantPrivileges as unknown as Record<string, unknown>;

  const policyData: Record<string, unknown> = {
    entity_field: 'entity_id',
    membership_type: 2,
  };

  try {
    // Standard API path
    const res = await apiClient.secureTableProvision.create({
      data: {
        databaseId,
        tableName: tableDef.name,
        nodeType: tableDef.nodeType,
        useRls: true,
        grantRoles: tableDef.grantRoles,
        grantPrivileges: grantPrivileges,
        policyType: tableDef.policyType,
        policyPermissive: true,
        policyData: policyData,
      },
      select: { id: true, tableId: true, outFields: true, tableName: true },
    }).execute();

    const provision = (res as any).createSecureTableProvision.secureTableProvision;
    const tableId = provision.tableId;

    // Compose additional modules (e.g., DataTimestamps)
    for (const comp of tableDef.compose ?? []) {
      await apiClient.secureTableProvision.create({
        data: {
          databaseId,
          tableId,
          nodeType: comp.nodeType,
          nodeData: { include_id: false, ...(comp.nodeData ?? {}) },
        },
        select: { id: true },
      }).execute();
    }

    return { name: tableDef.name, tableId };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);

    // Compatibility fallback: if roleName/granteeName field mismatch
    if (message.includes('roleName') || message.includes('granteeName')) {
      console.warn(`  Compatibility shim active for table "${tableDef.name}" — retrying with adjusted field names`);

      // Use low-level ORM path: create table, grants, and policies separately
      // 1. Create table with fields only (no grants/policies)
      const res = await apiClient.secureTableProvision.create({
        data: {
          databaseId,
          tableName: tableDef.name,
          nodeType: tableDef.nodeType,
          useRls: true,
        },
        select: { id: true, tableId: true, outFields: true },
      }).execute();

      const provision = (res as any).createSecureTableProvision.secureTableProvision;
      const tableId = provision.tableId;

      // 2. Create grants using low-level tableGrant (tries both field names)
      for (const [priv, scope] of tableDef.grantPrivileges) {
        for (const role of tableDef.grantRoles) {
          const grantData: Record<string, unknown> = {
            tableId,
            privilege: priv,
          };
          // Try granteeName first, fall back to roleName
          try {
            grantData.granteeName = role;
            await apiClient.tableGrant.create({
              data: grantData,
              select: { id: true },
            }).execute();
          } catch {
            delete grantData.granteeName;
            grantData.roleName = role;
            await apiClient.tableGrant.create({
              data: grantData,
              select: { id: true },
            }).execute();
          }
        }
      }

      // 3. Create policy (tries both field names)
      const policyBase: Record<string, unknown> = {
        tableId,
        privilege: 'all',
        permissive: true,
        policyType: tableDef.policyType,
        data: policyData,
      };
      try {
        policyBase.granteeName = 'authenticated';
        await apiClient.policy.create({
          data: policyBase,
          select: { id: true },
        }).execute();
      } catch {
        delete policyBase.granteeName;
        policyBase.roleName = 'authenticated';
        await apiClient.policy.create({
          data: policyBase,
          select: { id: true },
        }).execute();
      }

      // 4. Compose additional modules
      for (const comp of tableDef.compose ?? []) {
        await apiClient.secureTableProvision.create({
          data: {
            databaseId,
            tableId,
            nodeType: comp.nodeType,
            nodeData: { include_id: false, ...(comp.nodeData ?? {}) },
          },
          select: { id: true },
        }).execute();
      }

      return { name: tableDef.name, tableId };
    }

    throw err;
  }
}

async function main(): Promise<void> {
  const result: Partial<ProvisionResult> = {};

  // -----------------------------------------------------------------------
  // Step 1: Sign up and sign in on platform auth
  // -----------------------------------------------------------------------
  console.log('Step 1: Signing up and signing in on platform...');

  const authDb = auth.createClient({
    adapter: new NodeHttpAdapter(config.platformAuth),
  });

  // Sign up (ignore "already exists" errors)
  try {
    await authDb.mutation.signUp(
      { input: { email: config.auth.email, password: config.auth.password } },
      { select: { result: { select: { accessToken: true } } } },
    ).execute();
    console.log('  Sign-up succeeded.');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (!message.includes('already') && !message.includes('exists') && !message.includes('duplicate')) {
      throw err;
    }
    console.log('  User already exists, continuing to sign in...');
  }

  // Sign in
  const signInResult = await authDb.mutation.signIn(
    { input: { email: config.auth.email, password: config.auth.password } },
    { select: { result: { select: { accessToken: true, userId: true } } } },
  ).execute();

  const { accessToken, userId } = (signInResult as any).signIn.result;
  console.log(`  Platform sign-in succeeded. userId=${userId}`);

  result.auth = {
    platformUserId: userId,
    platformTokenRef: 'PLATFORM_ACCESS_TOKEN',
    perDbTokenRef: '',
  };

  // -----------------------------------------------------------------------
  // Step 2: Create database
  // -----------------------------------------------------------------------
  console.log('Step 2: Creating database...');

  const apiAdapter = new NodeHttpAdapter(config.platformApi);
  apiAdapter.setHeaders({ Authorization: `Bearer ${accessToken}` });
  const apiDb = platform.createClient({ adapter: apiAdapter });

  const dbResult = await apiDb.databaseProvisionModule.create({
    data: {
      databaseName: config.database.name,
      ownerId: userId,
      subdomain: config.database.name,
      domain: 'localhost',
      modules: config.database.modules,
      bootstrapUser: config.database.bootstrapUser,
    },
    select: { id: true, databaseId: true, databaseName: true, status: true },
  }).execute();

  const provisionModule = (dbResult as any).createDatabaseProvisionModule?.databaseProvisionModule;
  const databaseId = provisionModule?.databaseId;
  const databaseName = provisionModule?.databaseName ?? config.database.name;
  console.log(`  Database created. id=${databaseId}, name=${databaseName}`);

  // -----------------------------------------------------------------------
  // Step 3: Resolve schema prefix and apply workarounds
  // -----------------------------------------------------------------------
  console.log('Step 3: Applying post-provisioning workarounds...');

  const pgClient = new PgClient({
    host: process.env.PGHOST || 'localhost',
    port: Number(process.env.PGPORT) || 5432,
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '',
    database: 'constructive',
  });
  await pgClient.connect();

  // Resolve schema prefix by finding the membership schema
  const prefixResult = await pgClient.query(
    `SELECT table_schema FROM information_schema.tables
     WHERE table_name = 'app_membership_defaults'
       AND table_schema LIKE $1
     ORDER BY table_schema LIMIT 1`,
    [`${databaseName}-%memberships-public`],
  );

  if (prefixResult.rows.length === 0) {
    await pgClient.end();
    throw new Error(`Could not resolve schema prefix for database "${databaseName}". Provisioning may have failed.`);
  }

  const membershipSchema = prefixResult.rows[0].table_schema;
  const schemaPrefix = membershipSchema.replace(/-memberships-public$/, '');
  console.log(`  Resolved schema prefix: ${schemaPrefix}`);

  result.database = {
    name: databaseName,
    id: databaseId,
    schemaPrefix,
  };

  // Workaround: auto-verify-email
  const emailSchema = `${schemaPrefix}-user-identifiers-public`;
  try {
    await pgClient.query(`
      ALTER TABLE "${emailSchema}".emails
        ALTER COLUMN is_verified SET DEFAULT true;
      UPDATE "${emailSchema}".emails
        SET is_verified = true
        WHERE is_verified = false;
    `);
    console.log('  Applied auto-verify-email workaround.');
  } catch (err: unknown) {
    console.warn(`  auto-verify-email workaround failed (non-fatal): ${err instanceof Error ? err.message : err}`);
  }

  // Workaround: fix-membership-defaults
  try {
    await pgClient.query(`
      UPDATE "${membershipSchema}".app_membership_defaults
        SET is_approved = true, is_verified = true;
    `);
    console.log('  Applied fix-membership-defaults workaround.');
  } catch (err: unknown) {
    console.warn(`  fix-membership-defaults workaround failed (non-fatal): ${err instanceof Error ? err.message : err}`);
  }

  await pgClient.end();

  // -----------------------------------------------------------------------
  // Step 4: Sign in to per-database auth
  // -----------------------------------------------------------------------
  console.log('Step 4: Signing in to per-database auth...');

  const dbAuthDb = auth.createClient({
    adapter: new NodeHttpAdapter(`http://auth-${databaseName}.localhost:3000/graphql`),
  });

  const dbSignInResult = await dbAuthDb.mutation.signIn(
    { input: { email: config.auth.email, password: config.auth.password } },
    { select: { result: { select: { accessToken: true, userId: true } } } },
  ).execute();

  const dbAccessToken = (dbSignInResult as any).signIn.result.accessToken;
  result.auth!.perDbTokenRef = 'PER_DB_ACCESS_TOKEN';
  console.log('  Per-database sign-in succeeded.');

  // -----------------------------------------------------------------------
  // Step 5: Create secured tables
  // -----------------------------------------------------------------------
  console.log('Step 5: Creating secured tables...');

  // Table provisioning uses the platform API client with the platform token
  const createdTables: { name: string; tableId: string }[] = [];

  for (const tableDef of config.tables) {
    try {
      const tableResult = await createSecuredTableWithShim(apiDb, databaseId, tableDef);
      createdTables.push(tableResult);
      console.log(`  Created table: ${tableResult.name} (id=${tableResult.tableId})`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`  FAILED to create table "${tableDef.name}": ${message}`);
      throw err;
    }
  }

  result.tables = createdTables;
  console.log(`  Created ${createdTables.length} table(s).`);

  // Build a lookup map: table name -> tableId
  const tableIdMap = new Map(createdTables.map((t) => [t.name, t.tableId]));

  // -----------------------------------------------------------------------
  // Step 6: Create relations
  // -----------------------------------------------------------------------
  console.log('Step 6: Creating relations...');

  const createdRelations: string[] = [];

  for (const rel of config.relations) {
    const sourceTableId = tableIdMap.get(rel.source);
    const targetTableId = tableIdMap.get(rel.target);

    if (!sourceTableId || !targetTableId) {
      throw new Error(
        `Relation "${rel.source}" -> "${rel.target}" references a table not in the created tables list. ` +
        `Available: ${Array.from(tableIdMap.keys()).join(', ')}`,
      );
    }

    try {
      const relData: Record<string, unknown> = {
        databaseId,
        relationType: rel.type,
        sourceTableId,
        targetTableId,
      };

      if (rel.deleteAction) {
        relData.deleteAction = rel.deleteAction;
      }

      // Junction table security forwarding (for ManyToMany)
      if (rel.junctionSecurity) {
        relData.grantRoles = rel.junctionSecurity.grantRoles;
        relData.grantPrivileges = rel.junctionSecurity.grantPrivileges as unknown as Record<string, unknown>;
        relData.policyType = rel.junctionSecurity.policyType;
        relData.policyPermissive = true;
      }

      await apiDb.relationProvision.create({
        data: relData,
        select: { id: true, outFieldId: true, fieldName: true },
      }).execute();

      const descriptor = `${rel.source} -> ${rel.target} (${rel.type})`;
      createdRelations.push(descriptor);
      console.log(`  Created relation: ${descriptor}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`  FAILED to create relation "${rel.source} -> ${rel.target}": ${message}`);
      throw err;
    }
  }

  result.relations = createdRelations;
  console.log(`  Created ${createdRelations.length} relation(s).`);

  // -----------------------------------------------------------------------
  // Output result
  // -----------------------------------------------------------------------
  console.log('\n--- PROVISION RESULT ---');
  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error('Provision failed:', err.message || err);
  process.exit(1);
});
