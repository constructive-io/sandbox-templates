/**
 * create-db — the tenant, the way the dashboard requests one.
 *
 *   1. The owner's platform session (signed up on the first run).
 *   2. Operator step: the owner's `databases` allowance (see below).
 *   3. `requestDatabase` on the platform's api lane, as the owner — the
 *      platform makes the caller the tenant's owner.
 *   4. Wait for the ticket, then for the owner bootstrap the reconciler's
 *      `db_pool:bootstrap_owner` job runs after a warm claim (it copies the
 *      owner's identity, password hash included, into the tenant).
 *   5. Write the tenant's coordinates into .env for every later step.
 *
 * Idempotent: a tenant this owner already named DATABASE_NAME is reused.
 */

import { Client } from 'pg';

import { env, pgConfig, writeEnv } from './env.js';
import { gql, PLATFORM_API_ENDPOINT, platformSession, signIn } from './realm.js';

const DATABASE_NAME = env.DATABASE_NAME ?? 'myapp';
// The base domain request_database mints the tenant's API hosts under
// (api-<slug>.localhost, auth-<slug>.localhost, ...).
const BASE_DOMAIN = env.TENANT_BASE_DOMAIN ?? 'localhost';
// b2b:storage has a warm pool, so the claim is instant.
const PRESET_SLUG = env.DATABASE_PRESET ?? 'b2b:storage';

const REQUEST_DATABASE = `mutation RequestDatabase($input: RequestDatabaseInput!) {
  requestDatabase(input: $input) { result { id status databaseId } }
}`;

const sleep = (ms: number) => new Promise((done) => setTimeout(done, ms));

async function poll<T>(what: () => string, seconds: number, probe: () => Promise<T | null>): Promise<T> {
  for (let waited = 0; waited <= seconds; waited += 3) {
    const value = await probe();
    if (value !== null) return value;
    await sleep(3000);
  }
  throw new Error(`${what()}: still not done after ${seconds}s`);
}

async function main(): Promise<void> {
  const client = new Client(pgConfig);
  await client.connect();

  const owner = await platformSession(client, { create: true });
  console.log(`owner: ${env.OWNER_EMAIL ?? 'owner@myapp.local'} (platform user ${owner.userId})`);

  // Operator step, not the owner's: the platform has no free tier, so an
  // owner with no subscription may not create a database
  // (platform-database-limit-requires-plan). Locally there is no plan to buy,
  // so the owner gets the explicit unlimited `databases` row the platform's
  // own owners hold — byte for byte upstream's fixture helper
  // grantDatabaseAllowance (compute/testkit/test-utils/src/database-allowance.ts):
  // data, never a bypass. The owner is the subject of the row, not its author.
  await client.query(
    `INSERT INTO constructive_limits_public.app_limits (actor_id, name, num, max, plan_max)
     VALUES ($1, 'databases', 0, -1, -1)
     ON CONFLICT ON CONSTRAINT app_limits_name_actor_id_key DO UPDATE SET
       max = EXCLUDED.max, plan_max = EXCLUDED.plan_max`,
    [owner.userId]
  );
  console.log('databases allowance: unlimited (local stand-in for a subscription)');

  const existing = await client.query(
    `SELECT id FROM metaschema_public.database WHERE name = $1 AND owner_id = $2`,
    [DATABASE_NAME, owner.userId]
  );
  let databaseId: string;
  if (existing.rows.length > 0) {
    databaseId = (existing.rows[0] as { id: string }).id;
    console.log(`reusing tenant '${DATABASE_NAME}': ${databaseId}`);
  } else {
    const data = await gql<{
      requestDatabase: { result: { id: string; status: string; databaseId: string | null } };
    }>(
      PLATFORM_API_ENDPOINT,
      REQUEST_DATABASE,
      { input: { databaseName: DATABASE_NAME, domain: BASE_DOMAIN, presetSlug: PRESET_SLUG } },
      owner.token
    );
    const ticket = data.requestDatabase.result;
    console.log(`ticket ${ticket.id}: ${ticket.status}`);
    databaseId = await poll(() => 'tenant provisioning', 300, async () => {
      const { rows } = await client.query(
        `SELECT status, database_id, error_message
           FROM metaschema_modules_public.database_provision_module WHERE id = $1`,
        [ticket.id]
      );
      const row = rows[0] as { status: string; database_id: string | null; error_message: string | null };
      if (row.status === 'failed') throw new Error(`tenant provisioning failed: ${row.error_message ?? 'unknown error'}`);
      return row.status === 'completed' ? row.database_id : null;
    });
    console.log(`tenant '${DATABASE_NAME}' provisioned: ${databaseId}`);
  }

  // The tenant's hosts are named from its physical slug, not the catalog name
  // (api-208-dry-rose-fox.localhost); the provisioning machinery writes them.
  const slug = await poll(() => 'the tenant api-* domain row', 30, async () => {
    const { rows } = await client.query(
      `SELECT hostname FROM routing_public.domains WHERE database_id = $1 AND hostname LIKE 'api-%' LIMIT 1`,
      [databaseId]
    );
    const hostname = (rows[0] as { hostname: string } | undefined)?.hostname;
    return hostname ? hostname.replace(/^api-/, '').replace(new RegExp(`\\.${BASE_DOMAIN}$`), '') : null;
  });
  const authUrl = `http://auth-${slug}.${BASE_DOMAIN}/graphql`;

  // The owner bootstrap is the reconciler's job (db_pool:bootstrap_owner),
  // not this script's: it records its outcome on the ticket. A 'failed' row
  // is retried by the jobs infrastructure, so it is reported, not final.
  let lastError: string | null = null;
  await poll(() => `the owner bootstrap (last error: ${lastError ?? 'none'})`, 180, async () => {
    const { rows } = await client.query(
      `SELECT bootstrap_status, bootstrap_error
         FROM metaschema_modules_public.database_provision_module
        WHERE database_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [databaseId]
    );
    const row = rows[0] as { bootstrap_status: string | null; bootstrap_error: string | null } | undefined;
    if (!row) throw new Error(`no provisioning ticket names database ${databaseId}`);
    if (row.bootstrap_error && row.bootstrap_error !== lastError) {
      lastError = row.bootstrap_error;
      console.log(`  owner bootstrap failed, the job will retry: ${lastError}`);
    }
    return row.bootstrap_status === 'completed' ? true : null;
  });
  // The fact later steps rely on: the tenant realm issues the owner a session.
  await signIn(authUrl, databaseId);
  console.log('owner bootstrapped: the tenant realm issues the owner a session');

  // The GraphQL lanes go through the app's same-origin BFF proxy
  // (/api/graphql/*): the session cookie is host-only on the gateway host and
  // never reaches the *-<slug> hosts, so the proxy forwards it as a Bearer.
  writeEnv({
    DATABASE_ID: databaseId,
    NEXT_PUBLIC_DB_NAME: slug,
    NEXT_PUBLIC_API_PORT: '80',
    NEXT_PUBLIC_ADMIN_ENDPOINT: '/api/graphql/admin',
    NEXT_PUBLIC_AUTH_ENDPOINT: '/api/graphql/auth',
    GRAPHQL_ADMIN_URL: `http://admin-${slug}.${BASE_DOMAIN}/graphql`,
    GRAPHQL_AUTH_URL: authUrl,
    // Provisioning only (configure-sms): the tenant's own config/secrets API.
    GRAPHQL_CONFIG_URL: `http://config-${slug}.${BASE_DOMAIN}/graphql`
  });
  console.log(`tenant hosts: *-${slug}.${BASE_DOMAIN} (written to .env)`);

  await client.end();
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? (err.stack ?? err.message) : String(err));
  process.exit(1);
});
