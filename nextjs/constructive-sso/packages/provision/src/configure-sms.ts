/**
 * configure-sms — point the provisioned tenant at the SMS provider the
 * platform's `sms` cloud function reads (one image, per-tenant settings).
 *
 * Since upstream #3747 (frame-chain store resolution + `fun config|secrets
 * --database-id`) and #3765 (the auth-settings setup window measured from
 * owner bootstrap), everything this
 * script needs is a supported path. No store provisioning, no namespace
 * module, no ephemeral bypass principal:
 *
 *   1. `fun config set` SMS_PROVIDER + TWILIO_VERIFY_SERVICE_SID at
 *      `--scope database --database-id <tenant>` — writes the shared
 *      database-scope plane keyed by the tenant, the same store the sms
 *      invocation reads (nearest frame along the tenant's scope chain).
 *   2. `fun secrets set` TWILIO_ACCOUNT_SID + TWILIO_API_KEY_SID +
 *      TWILIO_API_KEY_SECRET, same targeting, values via --from-env so
 *      they never appear on a command line.
 *   3. A plain UPDATE of app_settings_auth.allow_sms_sign_in inside the
 *      setup window — measured from owner bootstrap (#3765), so it covers
 *      this script by design when run within six hours of claiming the
 *      tenant. The CLI creates the tenant's shared-plane namespace row on
 *      the first scoped write (#3845), so nothing is inserted by hand.
 *
 * All values come from the environment (.env): SMS_PROVIDER,
 * TWILIO_VERIFY_SERVICE_SID, TWILIO_ACCOUNT_SID, TWILIO_API_KEY_SID,
 * TWILIO_API_KEY_SECRET.
 *
 * Twilio side (one-time, outside this script): the Verify Service needs
 * CustomCodeEnabled=true — the digits Postgres generates ride as
 * `customCode`, so without the flag Twilio silently sends its own code and
 * every login fails at the check while sends stay green. API-settable:
 * POST /v2/Services/{sid} CustomCodeEnabled=true.
 *
 * Idempotent — every verb is a set-over-set.
 */

import { dirname, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import * as dotenv from 'dotenv';

const MODULE_DIR = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(MODULE_DIR, '../../../.env') });

const env = process.env;

const required = (name: string): string => {
  const value = env[name];
  if (!value) throw new Error(`missing ${name} in the environment (see .env.example)`);
  return value;
};

const DATABASE_ID = required('DATABASE_ID');
const PGHOST = env.PGHOST ?? 'localhost';
const PGPORT = env.PGPORT ?? '15432';
const PGDATABASE = env.PGDATABASE ?? 'constructive-functions-db1';

// Provider settings — configs the sms handler reads per invocation.
const SMS_PROVIDER = required('SMS_PROVIDER');
// Twilio Verify lane. (A devsms lane would only need DEVSMS_BASE_URL as a config.)
const TWILIO_VERIFY_SERVICE_SID = required('TWILIO_VERIFY_SERVICE_SID');

// The repo whose CLI runs the platform commands. From
// packages/provision/src that is six levels up to the workspace root —
// same target as local-bringup.sh's DB_REPO.
const DB_REPO = env.CONSTRUCTIVE_DB_DIR
  ?? resolve(MODULE_DIR, '../../../../../../constructive-db');

/** One `fun` platform command, run from the compute/ plane root so its env
 * layers load, against the forwarded Postgres. The CLI entry is invoked with
 * the running node binary (the npm-linked `fun` is not reliably on PATH). */
function fun(args: string[]): void {
  execFileSync(
    process.execPath,
    [resolve(DB_REPO, 'compute/fun/cli/dist/index.js'), ...args],
    {
      cwd: resolve(DB_REPO, 'compute'),
      env: { ...env, PGHOST, PGPORT, PGDATABASE },
      stdio: ['ignore', 'inherit', 'inherit'],
    }
  );
}

async function main(): Promise<void> {
  console.log(`tenant ${DATABASE_ID}: configuring the SMS lane through the platform CLI`);

  // ---- 1. Config rows (shared plane, keyed by the tenant). ----
  fun([
    'config', 'set', 'SMS_PROVIDER', SMS_PROVIDER,
    '--scope', 'database', '--database-id', DATABASE_ID,
    '--as', 'platform-bootstrap',
  ]);
  fun([
    'config', 'set', 'TWILIO_VERIFY_SERVICE_SID', TWILIO_VERIFY_SERVICE_SID,
    '--scope', 'database', '--database-id', DATABASE_ID,
    '--as', 'platform-bootstrap',
  ]);
  console.log(`config: SMS_PROVIDER = ${SMS_PROVIDER}`);
  console.log('config: TWILIO_VERIFY_SERVICE_SID = <set>');

  // ---- 2. Secrets (same targeting; values via --from-env). ----
  for (const name of ['TWILIO_ACCOUNT_SID', 'TWILIO_API_KEY_SID', 'TWILIO_API_KEY_SECRET']) {
    required(name); // fail early with the right message before invoking fun
    fun([
      'secrets', 'set', name, '--from-env', name,
      '--scope', 'database', '--database-id', DATABASE_ID,
      '--as', 'platform-bootstrap',
    ]);
    console.log(`secret: ${name} set`);
  }

  // ---- 3. Flip allow_sms_sign_in (the upstream-designed setup window). ----
  // #3765 reverted the `fun tenant auth-settings` verb (#3759) and instead
  // anchors the six-hour setup window on OWNER BOOTSTRAP — the earliest
  // human users row — rather than the settings row's created_at (which on
  // a warm-pool database is template bake time). Since this script runs
  // right after the tenant is claimed and its owner bootstrapped, the
  // plain UPDATE passes by design, no bypass principal needed. Run it
  // within six hours of claiming the tenant.
  const schema = execFileSync(
    'psql',
    ['-h', PGHOST, '-p', PGPORT, '-U', env.PGUSER ?? 'postgres', '-d', PGDATABASE, '-Atc',
      `SELECT s.schema_name FROM routing_public.rls_settings rs
         JOIN metaschema_public.schema s ON s.id = rs.authenticate_schema_id
        WHERE rs.database_id = '${DATABASE_ID}'::uuid`],
    { encoding: 'utf-8' }
  ).trim();
  execFileSync(
    'psql',
    ['-h', PGHOST, '-p', PGPORT, '-U', env.PGUSER ?? 'postgres', '-d', PGDATABASE,
      '-v', 'ON_ERROR_STOP=1', '-c',
      `UPDATE "${schema}".app_settings_auth SET allow_sms_sign_in = true`],
    { stdio: ['ignore', 'inherit', 'inherit'] }
  );
  console.log(`auth: allow_sms_sign_in = true on ${schema}.app_settings_auth (setup window measured from owner bootstrap per #3765)`);

  console.log(
    `tenant ${DATABASE_ID}: SMS lane configured (2 config rows, 3 secrets, ` +
    `provider '${SMS_PROVIDER}') — no store provisioning needed (shared plane)`
  );
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? (err.stack ?? err.message) || String(err) : String(err));
  process.exit(1);
});
