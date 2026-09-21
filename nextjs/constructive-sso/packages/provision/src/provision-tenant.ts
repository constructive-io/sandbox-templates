/**
 * provision-tenant — provision the SSO tenant on the compute platform.
 *
 * Automates the platform's production-shaped tenant creation for local
 * development, in order:
 *   1. authenticate as the platform-bootstrap principal (no invented JWTs —
 *      the same service identity `fun register` uses),
 *   2. request the tenant through metaschema_public.request_database with the
 *      b2b:storage preset (warm pool claim or cold async provisioning),
 *   3. poll the ticket until completed; run the deferred owner bootstrap,
 *   4. create the tenant-owned `localhost` domain row,
 *   5. write DATABASE_ID into .env for every later step.
 *
 * Route binding, the localhost ingress and the provider configuration are
 * separate steps (see local-bringup.sh) so each can be re-run alone.
 */

import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as dotenv from 'dotenv';
import { Client } from 'pg';

// The boilerplate root's .env — resolved from this module's location, not
// process.cwd(), so the script works no matter which directory launches it
// (src/ -> packages/provision/ -> packages/ -> project root).
// Loaded here so DATABASE_NAME / PGHOST overrides are honored even when this
// runs standalone (local:bringup sources it too, but this must not depend on
// that).
import { claimsFor, resolveActingUser } from './owner-identity.js';

const MODULE_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT_ENV_PATH = resolve(MODULE_DIR, '../../../.env');
dotenv.config({ path: ROOT_ENV_PATH });

const env = process.env;

const PGHOST = env.PGHOST ?? 'localhost';
const PGPORT = Number(env.PGPORT ?? 15432);
const PGDATABASE = env.PGDATABASE ?? 'constructive-functions-db1';
const PGUSER = env.PGUSER ?? 'postgres';
const PGPASSWORD = env.PGPASSWORD ?? 'password';

const DATABASE_NAME = env.DATABASE_NAME ?? 'myapp';
const DOMAIN = env.SSO_ROUTE_HOST ?? 'localhost';
// The tenant's module preset. `b2b:storage` has a warm pool (instant claim).
// The pure-consumption model (frame-chain routing, constructive-db PR #3475)
// needs NO function plane on the tenant — the shared mantra/sso/auth images
// are registered once at platform scope and a tenant route may target any
// definition on its own frame chain. NOTE: `full` provisions a function_module
// natively, but its cold path dispatches the database-provision-request job,
// whose seeded PG config points at the HOST-side port-forward (localhost:15432)
// — the job cannot reach that from inside its pod. Until that upstream
// --alt-ports bug is fixed, the warm preset is the working path.
const PRESET_SLUG = env.DATABASE_PRESET ?? 'b2b:storage';

const CLAIMS_SQL = `
  SELECT set_config(c.key, c.value, true)
  FROM jsonb_each_text($1::jsonb) AS c
`;

async function main(): Promise<void> {
  const client = new Client({ host: PGHOST, port: PGPORT, database: PGDATABASE, user: PGUSER, password: PGPASSWORD });
  try {
    await client.connect();
  } catch (err: unknown) {
    const detail = err instanceof Error ? (err.stack ?? err.message) : String(err);
    throw new Error(
      `cannot connect to the platform database (${PGHOST}:${PGPORT}/${PGDATABASE}) — ` +
        `is 'fun up --k8s --alt-ports' running and finished?\n${detail}`
    );
  }

  // The platform database, and who this run acts as: the real owner when
  // owner-login established one (issue-2 fix — request_database assigns the
  // CALLER the tenant's ownership), else the legacy machine principal.
  const platform = await client.query('SELECT app_scope.platform_database_id() AS id');
  const platformDatabaseId = (platform.rows[0] as { id: string }).id;
  const acting = await resolveActingUser(client, env.OWNER_USER_ID);
  const userId = acting.userId;
  const claims = claimsFor(platformDatabaseId, userId);
  console.log(
    acting.mode === 'owner'
      ? `acting as the owner user ${userId}`
      : 'acting as platform-bootstrap (legacy — the tenant will be machine-owned)'
  );

  // The owner bootstrap copies the requester's identity into the tenant, and it
  // requires a primary identifier (email). A real owner (owner-login) carries
  // one from sign-up; only the legacy machine principal needs it seeded.
  // Idempotent, so re-provisioning is safe.
  if (acting.mode === 'legacy') {
    await client.query(
      `INSERT INTO constructive_user_identifiers_public.emails (owner_id, email, is_verified, is_primary)
       VALUES ($1, $2, true, true) ON CONFLICT DO NOTHING`,
      [userId, 'platform-bootstrap@constructive.test']
    );
  }

  // 1. Request the tenant under the acting identity. Idempotent: a tenant
  //    this owner already named `DATABASE_NAME` is reused, not re-requested
  //    (the catalog's (owner_id, name) pair is unique).
  let tenantDatabaseId: string | null = null;
  const existing = await client.query(
    `SELECT id FROM metaschema_public.database WHERE name = $1 AND owner_id = $2`,
    [DATABASE_NAME, userId]
  );
  if (existing.rows.length > 0) {
    tenantDatabaseId = (existing.rows[0] as { id: string }).id;
    console.log(`reusing existing tenant '${DATABASE_NAME}': ${tenantDatabaseId}`);
  } else {
    await client.query('BEGIN');
    await client.query(CLAIMS_SQL, [claims]);
    const ticket = await client.query(
      `SELECT id, status, database_id FROM metaschema_public.request_database($1, $2, preset_slug := $3)`,
      [DATABASE_NAME, DOMAIN, PRESET_SLUG]
    );
    await client.query('COMMIT');
    const { id: ticketId, status: initialStatus, database_id: warmDatabaseId } = ticket.rows[0] as {
      id: string;
      status: string;
      database_id: string | null;
    };
    console.log(`ticket ${ticketId}: ${initialStatus}`);

    // 2. Poll the cold path to completion (a warm claim is already completed).
    tenantDatabaseId = warmDatabaseId;
    if (initialStatus !== 'completed') {
      for (let attempt = 0; attempt < 60; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        const row = await client.query(
          `SELECT status, database_id, error_message FROM metaschema_modules_public.database_provision_module WHERE id = $1`,
          [ticketId]
        );
        const current = row.rows[0] as { status: string; database_id: string | null; error_message: string | null };
        if (current.status === 'completed') {
          tenantDatabaseId = current.database_id;
          break;
        }
        if (current.status === 'failed') {
          throw new Error(`tenant provisioning failed: ${current.error_message ?? 'unknown error'}`);
        }
        if (attempt === 59) throw new Error('tenant provisioning timed out after 5 minutes');
      }
    }
    if (!tenantDatabaseId) throw new Error('ticket completed without a database_id');
  }

  // 3. Owner bootstrap: a warm claim carries a pool row whose bootstrap_status
  //    is pending; complete it with the same machinery the background job uses.
  const pool = await client.query(
    `SELECT id, bootstrap_status FROM metaschema_modules_public.db_pool WHERE database_id = $1`,
    [tenantDatabaseId]
  );
  if (pool.rows.length > 0 && (pool.rows[0] as { bootstrap_status: string }).bootstrap_status !== 'completed') {
    await client.query('BEGIN');
    await client.query(CLAIMS_SQL, [claims]);
    await client.query(`SELECT metaschema_private.db_pool_bootstrap_owner($1)`, [
      (pool.rows[0] as { id: string }).id,
    ]);
    await client.query('COMMIT');
    console.log('owner bootstrapped');
  }

  // 4. The tenant-owned `localhost` domain (the routing plane is shared; the
  //    domain row is keyed by the owning database).
  await client.query('BEGIN');
  await client.query(CLAIMS_SQL, [claims]);
  await client.query(
    `INSERT INTO routing_public.domains (hostname, database_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [DOMAIN, tenantDatabaseId]
  );
  await client.query('COMMIT');

  // 5. The platform derives the tenant's per-database hosts from the physical
  //    database's slug (NOT the catalog name) — e.g. api-208-dry-rose-fox.localhost.
  //    The app needs that slug for NEXT_PUBLIC_DB_NAME and the GraphQL upstreams.
  //    The rows are written by the provisioning machinery; on a cold ticket they
  //    can land a beat after the ticket flips to completed, so poll briefly.
  let slug: string | null = null;
  for (let attempt = 0; attempt < 10 && !slug; attempt += 1) {
    if (attempt > 0) await new Promise((resolve) => setTimeout(resolve, 3000));
    const tenantDomains = await client.query(
      `SELECT hostname FROM routing_public.domains WHERE database_id = $1 AND hostname LIKE 'api-%' LIMIT 1`,
      [tenantDatabaseId]
    );
    if (tenantDomains.rows.length > 0) {
      slug = (tenantDomains.rows[0] as { hostname: string }).hostname
        .replace(/^api-/, '')
        .replace(/\.localhost$/, '');
    }
  }
  if (!slug) {
    console.log('  (no api-* domain row after 30s — set NEXT_PUBLIC_DB_NAME / GRAPHQL_*_URL in .env manually)');
  }

  // 6. Persist the tenant's coordinates so configure-sso and the app use them.
  //    A fresh checkout may not have a root .env yet — create it rather than
  //    failing after a successful provision. The GraphQL lanes go through the
  //    same-origin BFF proxy (/api/graphql/*): the SSO session cookie is
  //    host-only on `localhost` and never reaches the per-tenant hosts, so the
  //    proxy forwards it server-side as a Bearer credential.
  const envValues: Record<string, string> = {
    DATABASE_ID: tenantDatabaseId,
    ...(slug
      ? {
          NEXT_PUBLIC_DB_NAME: slug,
          NEXT_PUBLIC_API_PORT: '80',
          NEXT_PUBLIC_ADMIN_ENDPOINT: '/api/graphql/admin',
          NEXT_PUBLIC_AUTH_ENDPOINT: '/api/graphql/auth',
          NEXT_PUBLIC_APP_ENDPOINT: '/api/graphql/app',
          GRAPHQL_ADMIN_URL: `http://admin-${slug}.localhost/graphql`,
          GRAPHQL_AUTH_URL: `http://auth-${slug}.localhost/graphql`,
          GRAPHQL_APP_URL: `http://api-${slug}.localhost/graphql`,
        }
      : {}),
  };
  if (!existsSync(ROOT_ENV_PATH)) {
    console.log(`root .env not found at ${ROOT_ENV_PATH} — creating it`);
    writeFileSync(ROOT_ENV_PATH, Object.entries(envValues).map(([k, v]) => `${k}=${v}`).join('\n') + '\n');
  } else {
    const envPath = ROOT_ENV_PATH;
    const envLines = readFileSync(envPath, 'utf8').split('\n');
    for (const [key, value] of Object.entries(envValues)) {
      const index = envLines.findIndex((line) => line.startsWith(`${key}=`));
      if (index >= 0) envLines[index] = `${key}=${value}`;
      else envLines.push(`${key}=${value}`);
    }
    writeFileSync(envPath, envLines.join('\n') + '\n');
  }

  console.log(`tenant '${DATABASE_NAME}' provisioned: ${tenantDatabaseId}${slug ? ` (hosts: *-${slug}.localhost)` : ''}`);
  console.log(`domain '${DOMAIN}' owned by the tenant — next: bind routes and configure the provider (local-bringup)`);

  await client.end();
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? (err.stack ?? err.message) || String(err) : String(err));
  process.exit(1);
});
