/**
 * seed/index.ts — Seed entry point for the constructive-app (BASE tier)
 *
 * Creates a couple of test users so you can sign in immediately after
 * provisioning. The base auth:email app has no organizations, so this seed
 * does NOT create orgs or org memberships.
 *
 * B2B OPT-IN: once you provision the org modules and add the registry org
 * blocks (see docs/B2B.md), extend this seed to create organizations and
 * org memberships (org users via the auth endpoint with the admin token, then
 * org_memberships rows in the {prefix}_memberships_public schema).
 *
 * Usage:
 *   pnpm run seed
 *
 * Prerequisites:
 *   - pnpm run create-db && pnpm run provision (sets up database + .env)
 *   - .env must contain DATABASE_ID, ACCESS_TOKEN
 */

import { config } from '../config.js';
import { createDbAuthClient, withRetry } from '../helpers.js';

// Seed fixtures

const SEED_USERS = [
  {
    email: 'alice@example.com',
    password: 'Password123!',
    displayName: 'Alice Chen',
  },
  {
    email: 'bob@example.com',
    password: 'Password123!',
    displayName: 'Bob Martinez',
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

  // -----------------------------------------------------------------------
  // Seed users
  // -----------------------------------------------------------------------
  console.log(`\n${'─'.repeat(50)}`);
  console.log('  Seeding users...');

  const userResults: SeedUserResult[] = [];

  for (const user of SEED_USERS) {
    console.log(`    ${user.email}`);
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
  // Done
  console.log(`\n${'═'.repeat(50)}`);
  console.log('  Seed complete!');
  console.log(`${'═'.repeat(50)}\n`);

  console.log('  Summary:');
  console.log(`    Users:  ${userResults.length}\n`);
}

main().catch((err) => {
  console.error('\nSeed failed:', err.message ?? err);
  process.exit(1);
});
