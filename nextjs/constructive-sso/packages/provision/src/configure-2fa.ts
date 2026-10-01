/**
 * configure-2fa — make the phone a login factor for this tenant's accounts.
 *
 * Two settings on `app_settings_auth`, both stated the way an admin would:
 *
 *   1. `verification_policy = {"sign_up":{"collect":["phone"]}}` — the
 *      policy the mantra /signup and the SSO first-login callback read: the
 *      sign-up form grows a required phone field, and every new account
 *      lands on /setup-2fa to verify a number and switch its SMS factor on.
 *      Unguarded by the step-up trigger (policy is data, not a toggle).
 *   2. `allow_sms_mfa = true` — the gate `enable_sms_mfa` reads; /setup-2fa
 *      flips the factor on only where the tenant allows one. Guarded by the
 *      step-up posture like the other auth toggles, so the write rides the
 *      owner-bootstrap setup window (#3765): run within six hours of
 *      claiming the tenant, same as configure-sms's flag flip.
 *
 * Per-user by design: the factor switch is `user_settings_security.
 * sms_mfa_enabled`, and sign-in (password and SSO alike) withholds the
 * session for any account that has it on. This script guarantees every NEW
 * account gets it at sign-up; existing accounts enroll through /setup-2fa.
 *
 * Idempotent — both verbs are set-over-set.
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

async function main(): Promise<void> {
  console.log(`tenant ${DATABASE_ID}: configuring the phone-2FA posture`);

  // The tenant's settings relation, resolved from its recorded facts — a
  // scope prefixes its physical tables, so 'auth_private.app_settings_auth'
  // is a literal that is right for exactly one tenant shape.
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
     `UPDATE "${schema}".app_settings_auth
         SET verification_policy = '{"sign_up":{"collect":["phone"]}}'::jsonb,
             allow_sms_mfa = true`],
    { stdio: ['ignore', 'inherit', 'inherit'] }
  );
  console.log(
    `auth: sign-up collects a phone + allow_sms_mfa on ${schema}.app_settings_auth ` +
      '(setup window measured from owner bootstrap per #3765)'
  );
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? (err.stack ?? err.message) || String(err) : String(err));
  process.exit(1);
});
