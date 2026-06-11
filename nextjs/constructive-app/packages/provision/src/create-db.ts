/** create-db.ts — Create a new tenant database. Usage: pnpm run create-db */

import { auth, public_ } from '@constructive-io/node';

import { asModules, AUTH_EMAIL_MODULES, type ProvisionModule } from './modules.js';

// BASE tier default module set: the `auth:email` preset.
//
// This is the ~13-module set that backs the email-password / profile auth
// flows (see references/flows.json → email-password.backend.modules). It is
// deliberately scoped to a single-user (app-level) auth surface: NO org /
// memberships{org} / hierarchy / invites modules. A base scaffold ships no
// org/b2b code, so it does not need those modules provisioned.
//
// B2B OPT-IN: an app that adopts the registry org blocks
// (org-create-card / org-members-list / org-roles-editor / org-settings-form)
// extends this set with the org modules — see docs/B2B.md.
//
// Scoped modules MUST use tuple form (['permissions_module', { scope: 'app' }]).
// The live provision proc REJECTS the colon-string form
// ('permissions_module:app') with a PROVISION-001 hard-fail.
const APP_MODULES: ProvisionModule[] = AUTH_EMAIL_MODULES;

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';

import { config } from './config.js';
import { withRetry, resolvePhysicalSchemaName } from './helpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const databaseName = config.databaseName || 'myapp';
  const adminEmail = config.adminEmail;

  console.log('\n  Constructive App — Create Database\n');
  console.log(`   Database:  ${databaseName}`);
  console.log(`   Admin:     ${adminEmail}`);

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
  const authClient = auth.createClient({ endpoint: config.authEndpoint, headers: {
    'X-Meta-Schema': 'true',
    'X-Schemata': 'constructive_auth_public'
  } });

  let userId: string | undefined;
  let accessToken: string | undefined;

  try {
    const signUpData = await authClient.mutation
      .signUp(
        { input: { email: adminEmail, password: config.adminPassword } },
        { select: { result: { select: { userId: true, accessToken: true } } } }
      )
      .unwrap();

    userId = (signUpData as Record<string, Record<string, Record<string, string>>>)
      ?.signUp?.result?.userId;
    accessToken = (signUpData as Record<string, Record<string, Record<string, string>>>)
      ?.signUp?.result?.accessToken;
  } catch (err: any) {
    if (err.message?.includes('ACCOUNT_EXISTS')) {
      console.log('   Admin user already exists — signing in');
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
    } else {
      throw err;
    }
  }

  if (!accessToken || !userId) {
    console.error('No token/userId returned from signUp');
    process.exit(1);
  }
  console.log(`   Signed up (ID: ${userId})`);

  // --- Step 2: Provision database (or use existing) ---
  // createDatabaseProvisionModule lives on the MODULES host (modules.localhost),
  // NOT api.localhost — its input type is only registered there. Routing it to
  // apiEndpoint fails with 'Unknown type CreateDatabaseProvisionModuleInput'.
  console.log('\n   Provisioning database (modules endpoint)...');
  console.log(`   Modules:   ${config.modulesEndpoint}`);
  const modulesClient = public_.createClient({ endpoint: config.modulesEndpoint, headers: {
    Authorization: `Bearer ${accessToken}`,
    'X-Meta-Schema': 'true'
  } });

  let databaseId: string;
  try {
    const provData = await withRetry(() =>
      modulesClient.databaseProvisionModule
        .create({
          data: {
            databaseName,
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
  } catch (err: any) {
    // Database already exists — use the DATABASE_ID from .env
    if (err.message?.includes('duplicate') || err.message?.includes('already exists')) {
      console.log('   Database already exists — using DATABASE_ID from .env');
      databaseId = config.databaseId!;
      if (!databaseId) {
        console.error('   Could not find existing database ID. Set DATABASE_ID in .env manually.');
        process.exit(1);
      }
      console.log(`   Database exists (ID: ${databaseId})`);
    } else {
      throw err;
    }
  }

  // Step 2.5: Database-level settings (tenant name may not be a real PG DB)
  if (pgAvailable) {
    try {
      const settingsPool = new Pool({ database: config.pgInternalDatabase });
      await settingsPool.query(`ALTER DATABASE "${databaseName}" SET constructive.simple_schema_names = 'true'`);
      await settingsPool.query(`ALTER DATABASE "${databaseName}" SET constructive.schema_use_underscores = 'true'`);
      await settingsPool.end();
      console.log('   constructive.simple_schema_names = true (database-level)');
      console.log('   constructive.schema_use_underscores = true (database-level)');
    } catch (err: any) {
      // Schema-based tenancy — server-level settings from Step 0 are sufficient
      console.log(`   Database-level settings skipped (${err.message?.split('\n')[0]})`);
      console.log('   Server-level settings from Step 0 are sufficient.');
    }
  }

  // Step 3: Register admin at db-scoped auth
  console.log('\n   Registering admin at db-scoped auth level...');
  const dbAuthEndpoint = `http://auth-${databaseName}.localhost:3000/graphql`;
  const dbAuthClient = auth.createClient({ endpoint: dbAuthEndpoint });

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

  // Grant admin permissions (SQL when PG available, GraphQL fallback)
  let permissionsGranted = false;
  if (dbAdminUserId && pgAvailable) {
    try {
      // Resolve THIS tenant's physical app-memberships schema via the metaschema
      // (scoped by database_id), NOT a floating `LIKE '%memberships_public'` —
      // on a shared hub that LIKE can match a SIBLING tenant and corrupt its
      // permissions. The metaschema read uses the freshly-issued accessToken
      // (config.databaseId/ACCESS_TOKEN aren't in process env until .env is written).
      const membershipsSchema = await resolvePhysicalSchemaName(databaseId, 'memberships_public', {
        token: accessToken,
      });
      console.log(`   Memberships schema (this tenant): ${membershipsSchema ?? '(none)'}`);
      if (membershipsSchema) {
        // Connect to the internal PG database (NOT PGDATABASE which may be 'postgres').
        // Schema-based multi-tenancy stores all tenant schemas in this DB.
        const permPool = new Pool({ database: config.pgInternalDatabase });
        const updateResult = await permPool.query(
          `UPDATE "${membershipsSchema}".app_memberships
           SET is_admin = true, is_owner = true,
               permissions = '1111111111111111111111111111111111111111111111111111111111111111'::bit(64)
           WHERE actor_id = $1`,
          [dbAdminUserId]
        );
        console.log(`   Admin permissions granted (SQL): ${updateResult.rowCount} row(s) updated`);
        permissionsGranted = true;
        await permPool.end();
      } else {
        console.warn('   No memberships_public schema found for this tenant — will try GraphQL fallback');
      }
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
        const { createClient: createAdminClient } = await import('@constructive-io/node').then(m => m.public_);
        const adminClient = createAdminClient({
          endpoint: adminEndpoint,
          headers: { Authorization: `Bearer ${dbAccessToken}` },
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

  // Step 4: Write .env
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
  console.log(`\n  Database created. Run \`pnpm run provision\` to apply schemas.\n`);
}

main().catch((err) => {
  console.error('create-db failed:', err.message ?? err);
  process.exit(1);
});
