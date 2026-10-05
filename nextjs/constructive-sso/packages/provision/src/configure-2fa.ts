/**
 * configure-2fa — the tenant's verification policy: the second-factor switch,
 * and code-first registration.
 *
 * Both live in `app_settings_auth.verification_policy`:
 *
 *   two_factor          the switch below (TWO_FACTOR)
 *   sign_up.verify      always 'code': email + password registration emails a
 *                       6-digit code first, and the account is created only
 *                       once that code is entered — already verified. An
 *                       address that already has an account is told so on the
 *                       sign-up page (with a link to reset the password) and
 *                       is sent nothing. Phone registration verifies by its
 *                       texted code either way.
 *
 * The switch:
 *
 *   on  (default)  every password sign-in is challenged with a code emailed to
 *                  the address the user signed in with (an enrolled
 *                  authenticator answers instead), and sensitive actions —
 *                  deleting an org, changing auth settings, credentials —
 *                  demand a fresh code on the account's own channel: email
 *                  for an email account, a text for a phone sign-up.
 *   off            no second factor at sign-in, and no step-up code for
 *                  sensitive actions.
 *
 * Neither state touches registration: an email sign-up verifies its address
 * and a phone sign-up its number either way, and a phone is never asked for
 * at email sign-up (users add one later under account settings). Sign-ins
 * that already proved possession — the texted code, the magic link — and
 * identity-provider sign-ins are not challenged again.
 *
 *   TWO_FACTOR=off pnpm run configure-2fa     # turn it off
 *   pnpm run configure-2fa                    # turn it on (default)
 *
 * The column is under the auth-settings step-up posture, so the write rides
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

  // The whole policy is replaced: an earlier version of this script wrote
  // {"sign_up":{"collect":["phone"]}}, which made email sign-up ask for a
  // phone and switched every new account's SMS factor on.
  const policy = { two_factor: twoFactor, sign_up: { verify: 'code' } };
  execFileSync(
    'psql',
    ['-h', PGHOST, '-p', PGPORT, '-U', env.PGUSER ?? 'postgres', '-d', PGDATABASE,
     '-v', 'ON_ERROR_STOP=1', '-c',
     `UPDATE "${schema}".app_settings_auth
         SET verification_policy = '${JSON.stringify(policy)}'::jsonb`],
    { stdio: ['ignore', 'inherit', 'inherit'] }
  );
  console.log(
    `auth: verification_policy = ${JSON.stringify(policy)} on ${schema}.app_settings_auth ` +
      '(setup window measured from owner bootstrap per #3765)'
  );
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? (err.stack ?? err.message) || String(err) : String(err));
  process.exit(1);
});
