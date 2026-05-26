/**
 * seed/index.ts — Seed entry point for constructive-app
 *
 * Creates test users and organizations for development.
 *
 * Usage:
 *   pnpm run seed
 *
 * Prerequisites:
 *   - pnpm run create-db && pnpm run provision (sets up database + .env)
 *   - .env must contain DATABASE_ID, ACCESS_TOKEN
 */

import { config } from '../config.js';
import { createDbAuthClient, withRetry, executeAuthMutation } from '../helpers.js';

// ---------------------------------------------------------------------------
// Seed fixtures
// ---------------------------------------------------------------------------

const SEED_USERS = [
  {
    email: 'alice@example.com',
    password: 'password123!',
    displayName: 'Alice Chen',
    role: 'founder' as const,
  },
  {
    email: 'bob@example.com',
    password: 'password123!',
    displayName: 'Bob Martinez',
    role: 'member' as const,
  },
];

const SEED_ORGS = [
  {
    name: 'Acme Corp',
    username: 'acme_corp',
    ownerIdIndex: 0, // Alice
  },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

interface SeedUserResult {
  fixture: typeof SEED_USERS[number];
  userId: string;
  accessToken: string;
}

async function main() {
  console.log('\n  Constructive App — Seed Database\n');
  console.log(`  Database:  ${config.databaseName}`);
  console.log(`  DB ID:     ${config.databaseId}`);

  if (!config.databaseId || !config.accessToken) {
    console.error('\n  Missing DATABASE_ID or ACCESS_TOKEN in .env');
    console.error('  Run: pnpm run create-db && pnpm run provision\n');
    process.exit(1);
  }

  // -----------------------------------------------------------------------
  // Step 1: Seed users
  // -----------------------------------------------------------------------
  console.log(`\n${'─'.repeat(50)}`);
  console.log('  Seeding users...');

  const userResults: SeedUserResult[] = [];

  for (const user of SEED_USERS) {
    console.log(`    ${user.email} (${user.role})`);
    const authClient = createDbAuthClient();

    let userId: string | undefined;
    let accessToken: string | undefined;

    try {
      const signUpData = await withRetry(() =>
        authClient.mutation
          .signUp(
            { input: { email: user.email, password: user.password } },
            { select: { result: { select: { userId: true, accessToken: true } } } }
          )
          .unwrap()
      );

      const result = (signUpData as Record<string, Record<string, Record<string, string>>>)
        ?.signUp?.result;
      userId = result?.userId;
      accessToken = result?.accessToken;
    } catch (err: any) {
      if (err.message?.includes('ACCOUNT_EXISTS')) {
        console.log(`    (already exists — signing in)`);
        const signInData = await authClient.mutation
          .signIn(
            { input: { email: user.email, password: user.password } },
            { select: { result: { select: { userId: true, accessToken: true } } } }
          )
          .unwrap();
        const result = (signInData as Record<string, Record<string, Record<string, string>>>)
          ?.signIn?.result;
        userId = result?.userId;
        accessToken = result?.accessToken;
      } else {
        throw err;
      }
    }

    if (!userId) {
      console.error(`    Failed to sign up ${user.email}`);
      continue;
    }

    userResults.push({ fixture: user, userId, accessToken: accessToken! });
    console.log(`    ✓ ${userId}`);
  }

  // -----------------------------------------------------------------------
  // Step 2: Get admin token for org creation
  // -----------------------------------------------------------------------
  console.log(`\n${'─'.repeat(50)}`);
  console.log('  Getting admin token...');

  const adminAuthClient = createDbAuthClient();
  const adminSignInData = await adminAuthClient.mutation.signIn(
    { input: { email: config.adminEmail, password: config.adminPassword } },
    { select: { result: { select: { accessToken: true, userId: true } } } }
  ).unwrap();

  const adminResult = (adminSignInData as Record<string, Record<string, Record<string, string>>>)
    ?.signIn?.result;
  const adminToken = adminResult?.accessToken;
  const adminUserId = adminResult?.userId;

  if (!adminToken) {
    console.error('  Failed to get admin token');
    process.exit(1);
  }
  console.log(`  Admin token acquired`);

  // -----------------------------------------------------------------------
  // Step 3: Seed orgs (org users via auth endpoint with admin token)
  // -----------------------------------------------------------------------
  console.log(`\n${'─'.repeat(50)}`);
  console.log('  Seeding orgs...');

  const orgEntityIds: { name: string; entityId: string }[] = [];

  for (const org of SEED_ORGS) {
    console.log(`    ${org.name} (${org.username})`);

    try {
      const createData = await withRetry(() =>
        executeAuthMutation(
          adminToken,
          `mutation CreateUser($input: CreateUserInput!) {
            createUser(input: $input) {
              user {
                id
                username
                displayName
                type
              }
            }
          }`,
          {
            input: {
              user: {
                username: org.username,
                displayName: org.name,
                type: 2 // organization
              }
            }
          }
        )
      );

      const raw = createData as any;
      const entityId: string | undefined = raw?.createUser?.user?.id;

      if (entityId) {
        orgEntityIds.push({ name: org.name, entityId });
        console.log(`    ✓ ${entityId}`);
      }
    } catch (err: any) {
      if (err.message?.includes('already exists') || err.message?.includes('duplicate') || err.message?.includes('ACCOUNT_EXISTS')) {
        console.log(`    ⚠ ${org.name} already exists — skipping`);
      } else {
        console.error(`    ✗ Failed to create org ${org.name}: ${err.message}`);
      }
    }
  }

  // -----------------------------------------------------------------------
  // Step 4: Add org memberships via direct SQL
  // -----------------------------------------------------------------------
  const pgAvailable = !!process.env.PGHOST;
  if (pgAvailable && orgEntityIds.length > 0) {
    console.log(`\n${'─'.repeat(50)}`);
    console.log('  Adding org memberships...');

    const { Pool } = await import('pg');
    const pool = new Pool({ database: config.pgInternalDatabase });

    try {
      const schemaRes = await pool.query(
        `SELECT schema_name FROM information_schema.schemata
         WHERE schema_name LIKE '%memberships_public' LIMIT 1`
      );
      const membershipsSchema = schemaRes.rows[0]?.schema_name;
      if (!membershipsSchema) {
        console.warn('    Memberships schema not found — skipping org memberships');
      } else {
        for (const org of orgEntityIds) {
          // Add seed users to org
          for (const user of userResults) {
            const isOwner = SEED_ORGS.find(o => o.name === org.name)?.ownerIdIndex === SEED_USERS.indexOf(user.fixture);
            try {
              await pool.query(
                `INSERT INTO "${membershipsSchema}".org_memberships
                   (actor_id, entity_id, is_owner, is_admin, is_approved, is_active)
                 VALUES ($1, $2, $3, $3, true, true)
                 ON CONFLICT DO NOTHING`,
                [user.userId, org.entityId, isOwner]
              );
              const role = isOwner ? 'org owner' : 'org member';
              console.log(`    ✓ ${user.fixture.displayName} → ${role} of ${org.name}`);
            } catch (err: any) {
              console.warn(`    ⚠ Org membership failed: ${err.message}`);
            }
          }

          // Add admin as org owner
          if (adminUserId) {
            try {
              await pool.query(
                `INSERT INTO "${membershipsSchema}".org_memberships
                   (actor_id, entity_id, is_owner, is_admin, is_approved, is_active)
                 VALUES ($1, $2, true, true, true, true)
                 ON CONFLICT DO NOTHING`,
                [adminUserId, org.entityId]
              );
              console.log(`    ✓ admin → org owner of ${org.name}`);
            } catch (err: any) {
              console.warn(`    ⚠ Admin org membership failed: ${err.message}`);
            }
          }
        }
      }
    } finally {
      await pool.end();
    }
  }

  // -----------------------------------------------------------------------
  // Done
  // -----------------------------------------------------------------------
  console.log(`\n${'═'.repeat(50)}`);
  console.log('  Seed complete!');
  console.log(`${'═'.repeat(50)}\n`);

  console.log('  Summary:');
  console.log(`    Users:  ${userResults.length}`);
  console.log(`    Orgs:   ${orgEntityIds.length}\n`);
}

main().catch((err) => {
  console.error('\nSeed failed:', err.message ?? err);
  process.exit(1);
});
