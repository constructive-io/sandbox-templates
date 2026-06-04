/** seed/index.ts — Create test users and orgs. Usage: pnpm run seed */

import { config } from '../config.js';
import { createDbAuthClient, withRetry, executeAuthMutation } from '../helpers.js';

// Seed fixtures

const SEED_USERS = [
  {
    email: 'alice@example.com',
    password: 'Password123!',
    displayName: 'Alice Chen',
    role: 'founder' as const,
  },
  {
    email: 'bob@example.com',
    password: 'Password123!',
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

// Main

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

  // Step 1: Seed users
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

  // Step 2: Get admin token
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

  // Step 3: Seed orgs via auth endpoint
  console.log(`\n${'─'.repeat(50)}`);
  console.log('  Seeding orgs...');

  const orgEntityIds: { name: string; entityId: string }[] = [];

  for (const org of SEED_ORGS) {
    console.log(`    ${org.name} (${org.username})`);

    try {
      // signUp + SQL pattern: INSERT on users via GraphQL is restricted,
      // but signUp uses a SECURITY DEFINER function that bypasses GRANTs.
      // After signUp, set type=2 (Organization) via direct SQL.
      const signUpData = await withRetry(() =>
        executeAuthMutation(
          adminToken,
          `mutation SignUp($input: SignUpInput!) {
            signUp(input: $input) {
              result {
                userId
              }
            }
          }`,
          {
            input: {
              email: `${org.username}@org.seed.local`,
              password: crypto.randomUUID(),
            }
          }
        )
      );

      const signUpRaw = signUpData as any;
      const orgUserId: string | undefined = signUpRaw?.signUp?.result?.userId;

      if (!orgUserId) {
        console.error(`    ✗ Failed to sign up org user for ${org.name}`);
        continue;
      }

      // Set display name and username via updateUser (those columns are in UPDATE GRANT)
      await withRetry(() =>
        executeAuthMutation(
          adminToken,
          `mutation UpdateUser($input: UpdateUserInput!) {
            updateUser(input: $input) {
              user { id }
            }
          }`,
          {
            input: {
              id: orgUserId,
              userPatch: {
                username: org.username,
                displayName: org.name,
              }
            }
          }
        )
      );

      // Set type=2 (Organization) via direct SQL — the `type` column
      // is only in the INSERT GRANT, not UPDATE, and INSERT GRANTs may
      // not be applied to tenant schemas.
      if (!!process.env.PGHOST) {
        try {
          const { Pool } = await import('pg');
          const pool = new Pool({ database: config.pgInternalDatabase });
          const usersSchema = await pool.query(
            `SELECT schema_name FROM information_schema.schemata
             WHERE schema_name LIKE '%users_public' AND schema_name LIKE '${config.databaseName}%'
             ORDER BY schema_name LIMIT 1`
          );
          const schemaName = usersSchema.rows[0]?.schema_name;
          if (schemaName) {
            await pool.query(
              `UPDATE "${schemaName}".users SET type = 2, display_name = $2, username = $3 WHERE id = $1`,
              [orgUserId, org.name, org.username]
            );
            console.log(`    ✓ type=2 set via SQL`);
          }
          await pool.end();
        } catch (sqlErr: any) {
          console.warn(`    ⚠ SQL type update failed: ${sqlErr.message}`);
        }
      }

      orgEntityIds.push({ name: org.name, entityId: orgUserId });
      console.log(`    ✓ ${orgUserId}`);
    } catch (err: any) {
      if (err.message?.includes('already exists') || err.message?.includes('duplicate') || err.message?.includes('ACCOUNT_EXISTS')) {
        console.log(`    ⚠ ${org.name} already exists — skipping`);
      } else {
        console.error(`    ✗ Failed to create org ${org.name}: ${err.message}`);
      }
    }
  }

  // Step 4: Add org memberships via SQL
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

  // Done
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
