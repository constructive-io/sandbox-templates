/**
 * configure-auth — the tenant's auth policy (`app_settings_auth`), stated once,
 * as its owner.
 *
 * The row is the tenant's one generated settings row. It is not on any GraphQL
 * surface, so this writes it the way upstream's setAuthSettings does
 * (compute/testkit/test-utils/src/auth-settings.ts): an UPDATE as a signed-in
 * owner. Here the owner is really signed in: the claims are what the tenant's
 * own authenticate() answers for the owner's tenant session (realm.ts).
 *
 * The row's guard_step_up trigger is the rule this respects (Dan, planning
 * #2055: "the user must 2FA if there is a 2FA"; no principal or service path
 * gets around it). Inside the setup window — six hours from the owner's
 * bootstrap into the tenant — the owner's password session may write it.
 * After that it needs a fresh MFA proof, and this step fails naming the guard.
 * Only columns that differ are written, so a re-run with nothing to change
 * never meets the guard at all.
 *
 *   TWO_FACTOR=on (default) | off   require_mfa: a password sign-in by a user
 *                                   with no factor is sent to /setup-2fa.
 *                                   Magic-link, SMS and SSO sign-ins are never
 *                                   flagged for setup (only password sign-in
 *                                   answers mfaSetupRequired).
 *   STEP_UP_WINDOW='2 minutes'      optional step_up_window (a Postgres
 *                                   interval): how recently a session must have
 *                                   signed in or verified a code before a
 *                                   step-up-guarded write (deleting an
 *                                   organization, adding a phone). Unset keeps
 *                                   the tenant default, 30 minutes; shorten it
 *                                   to see the step-up prompt without waiting.
 *   NATIVE_REDIRECT_URIS='myapp://auth'
 *                                   optional, comma-separated: the deep links a
 *                                   native (desktop, mobile) app may have the
 *                                   hosted sign-in pages hand a Google or
 *                                   magic-link sign-in back to. Once any is
 *                                   listed, loopback (http://127.0.0.1 on any
 *                                   port) is accepted too. Unset keeps the
 *                                   tenant's list, empty by default: no native
 *                                   hand-off.
 */

import { Client } from 'pg';

import { env, pgConfig, required } from './env.js';
import { asSession, tenantSession } from './realm.js';

const DATABASE_ID = required('DATABASE_ID');

const switchOf = (raw: string | undefined): boolean => {
  const value = (raw ?? 'on').trim().toLowerCase();
  if (value === 'on' || value === 'true') return true;
  if (value === 'off' || value === 'false') return false;
  throw new Error(`TWO_FACTOR must be on or off, not ${JSON.stringify(raw)}`);
};

const POLICY: Record<string, boolean | string | null> = {
  // Provider sign-in (configure-sso): an unverified provider address is refused,
  // and refusals land on the app's login page.
  allow_identity_sign_in: true,
  allow_identity_sign_up: true,
  oauth_require_verified_email: true,
  oauth_error_redirect_path: '/login',
  // The session cookie: host-only (no Domain) — the app and the gateway share
  // the `localhost` cookie host across ports — and plain HTTP locally.
  cookie_domain: null,
  cookie_secure: false,
  cookie_samesite: 'lax',
  // Emailed-link sign-in (configure-email) and SMS sign-in (configure-sms).
  allow_magic_link_sign_in: true,
  allow_magic_link_sign_up: true,
  allow_sms_sign_in: true,
  allow_sms_sign_up: true,
  // Second factors /setup-2fa offers, and whether password sign-in requires one.
  allow_email_mfa: true,
  allow_sms_mfa: true,
  require_mfa: switchOf(env.TWO_FACTOR)
};
const STEP_UP_WINDOW = env.STEP_UP_WINDOW?.trim() || null;
const NATIVE_REDIRECT_URIS =
  env.NATIVE_REDIRECT_URIS === undefined
    ? null
    : env.NATIVE_REDIRECT_URIS.split(',')
        .map((uri) => uri.trim())
        .filter(Boolean);

async function main(): Promise<void> {
  const client = new Client(pgConfig);
  await client.connect();
  const owner = await tenantSession();

  await asSession(client, owner, DATABASE_ID, async () => {
    const mod = await client.query(
      `SELECT s.schema_name, t.name
         FROM metaschema_modules_public.sessions_module sm
         JOIN metaschema_public.schema s ON s.id = sm.schema_id
         JOIN metaschema_public.table t ON t.id = sm.auth_settings_table_id
        WHERE sm.database_id = $1`,
      [DATABASE_ID]
    );
    const { schema_name, name } = mod.rows[0] as { schema_name: string; name: string };
    const settings = `${client.escapeIdentifier(schema_name)}.${client.escapeIdentifier(name)}`;
    const current = await client.query(`SELECT ${Object.keys(POLICY).join(', ')} FROM ${settings}`);
    if (current.rowCount !== 1) {
      throw new Error(`tenant ${DATABASE_ID} has ${current.rowCount} auth settings rows, not one`);
    }
    const row = current.rows[0] as Record<string, unknown>;
    const changed: { column: string; value: boolean | string | string[] | null; cast: string }[] = Object.keys(POLICY)
      .filter((column) => row[column] !== POLICY[column])
      .map((column) => ({ column, value: POLICY[column], cast: '' }));
    if (STEP_UP_WINDOW) {
      // An interval is compared in Postgres's own spelling, so '2 minutes' and
      // '00:02:00' are the same setting and a re-run writes nothing.
      const window = (
        await client.query(`SELECT step_up_window::text AS current, $1::interval::text AS wanted FROM ${settings}`, [
          STEP_UP_WINDOW
        ])
      ).rows[0] as { current: string; wanted: string };
      if (window.current !== window.wanted) {
        changed.push({ column: 'step_up_window', value: STEP_UP_WINDOW, cast: '::interval' });
      }
    }
    if (NATIVE_REDIRECT_URIS) {
      const current = (await client.query(`SELECT native_redirect_uris FROM ${settings}`)).rows[0] as {
        native_redirect_uris: string[] | null;
      };
      if (JSON.stringify(current.native_redirect_uris ?? []) !== JSON.stringify(NATIVE_REDIRECT_URIS)) {
        changed.push({ column: 'native_redirect_uris', value: NATIVE_REDIRECT_URIS, cast: '::text[]' });
      }
    }
    if (changed.length === 0) {
      console.log('auth settings: already as stated');
      return;
    }
    try {
      await client.query(
        `UPDATE ${settings} SET ${changed.map((c, i) => `${c.column} = $${i + 1}${c.cast}`).join(', ')}`,
        changed.map((c) => c.value)
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (/STEP_UP_REQUIRED/.test(message)) {
        throw new Error(
          `the auth settings guard refused the owner (${message}). The six-hour setup window after the ` +
            "owner's bootstrap has closed: these columns now need a fresh MFA proof from the owner.",
          { cause: err }
        );
      }
      throw err;
    }
    console.log(`auth settings: ${changed.map((c) => `${c.column} = ${JSON.stringify(c.value)}`).join(', ')}`);
  });

  await client.end();
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? (err.stack ?? err.message) : String(err));
  process.exit(1);
});
