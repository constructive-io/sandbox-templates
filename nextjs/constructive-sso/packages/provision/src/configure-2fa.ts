/**
 * configure-2fa — the tenant's three 2FA switches on `app_settings_auth`.
 *
 * Main's switches are plain booleans (the `verification_policy` JSON column
 * belonged to a design that never merged):
 *
 *   require_mfa       TWO_FACTOR=on. A password sign-in by a user with no
 *                     second factor still mints the session, and `signIn`
 *                     answers `mfaSetupRequired` — the hosted `/login` and
 *                     the app's sign-in route both send the user to the
 *                     hosted `/setup-2fa` (required mode: no skip until a
 *                     factor is on).
 *   allow_email_mfa   always on for this demo tenant (the spec default).
 *   allow_sms_mfa     always on for this demo tenant (the spec default is
 *                     off; configure-sms has given the tenant a provider).
 *
 * With both allow_* switches on, `/setup-2fa` offers either factor and
 * `enable_email_mfa` / `enable_sms_mfa` accept them; step-up codes
 * (`sendStepUpCode` / `verifyStepUpCode`) go through whichever factors the
 * account has on.
 *
 *   TWO_FACTOR=off pnpm run configure-2fa     # require_mfa off
 *   pnpm run configure-2fa                    # require_mfa on (default)
 *
 * The columns are under the auth-settings step-up posture, so the write rides
 * the owner-bootstrap setup window (#3765): run within six hours of claiming
 * the tenant, as the bring-up does. Idempotent — set-over-set.
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

const switchOf = (raw: string | undefined): boolean => {
  const value = (raw ?? 'on').trim().toLowerCase();
  if (value === 'on' || value === 'true') return true;
  if (value === 'off' || value === 'false') return false;
  throw new Error(`TWO_FACTOR must be on or off, not ${JSON.stringify(raw)}`);
};

async function main(): Promise<void> {
  const twoFactor = switchOf(env.TWO_FACTOR);
  console.log(`tenant ${DATABASE_ID}: two-factor ${twoFactor ? 'on' : 'off'}`);

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

  // Main's 2FA switches are the plain booleans on app_settings_auth
  // (the verification_policy JSON column belonged to the flexible-2fa design
  // that never merged). require_mfa is the forced-setup flag: a factorless
  // password sign-in answers mfa_setup_required and /login sends the user to
  // /setup-2fa. The allow_* switches gate which factors the setup page and
  // enable_*_mfa accept; email defaults on, SMS defaults off — both on for
  // this demo tenant, which configure-sms just gave a provider.
  const sets = [
    'allow_email_mfa = true',
    'allow_sms_mfa = true',
    `require_mfa = ${twoFactor}`
  ];
  execFileSync(
    'psql',
    ['-h', PGHOST, '-p', PGPORT, '-U', env.PGUSER ?? 'postgres', '-d', PGDATABASE,
     '-v', 'ON_ERROR_STOP=1', '-c',
     `UPDATE "${schema}".app_settings_auth
         SET ${sets.join(', ')}`],
    { stdio: ['ignore', 'inherit', 'inherit'] }
  );
  console.log(
    `auth: ${sets.join(', ')} on ${schema}.app_settings_auth ` +
      '(setup window measured from owner bootstrap per #3765)'
  );
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? (err.stack ?? err.message) || String(err) : String(err));
  process.exit(1);
});
