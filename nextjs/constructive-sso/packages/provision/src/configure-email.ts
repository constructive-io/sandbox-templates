/**
 * configure-email — give the provisioned tenant a sender identity so its
 * transactional email actually leaves (verification links, magic links,
 * verification codes), pointing at the platform's in-cluster Mailpit sink.
 *
 * The email function refuses to send for a tenant that has recorded no
 * identity (`ctx.email.require()` throws rather than inheriting the
 * platform's address), so without this script every email job fails. The
 * two rows it writes are the whole local story:
 *
 *   1. A provider account (provider 'smtp') whose host is the Mailpit service
 *      `fun up` renders from the platform-mailpit bundle — `:1025`, no AUTH
 *      (an unauthenticated relay is a supported SMTP path: the mailer only
 *      consults the credential when the account names an SMTP user, and
 *      Mailpit names none — the secret stays unset). The credential is named
 *      'SMTP_PASS' because that is a secret the email function already
 *      declares; any other name is refused as undeclared before the send.
 *   2. The database scope's default identity (`is_default`), transport_mode
 *      'own', sending through that account.
 *
 * Then the auth flips, as plain UPDATEs inside the owner-bootstrap setup
 * window (measured from owner bootstrap per #3765, same as configure-sms):
 *   - allow_magic_link_sign_in / allow_magic_link_sign_up — the lanes this
 *     tenant should demo
 *   - enforce_primary_auth_method = false — demo-permissive: an account that
 *     signed up with a password may also sign in by magic link. NULL-primary
 *     accounts pass regardless; upstream pinning semantics are untouched.
 *     (The email-code login lane stays OFF: its switch,
 *     allow_email_otp_sign_in, is deliberately not flipped — emailed codes
 *     belong to recovery, not to login, and this tenant logs in by password,
 *     SSO or magic link.)
 *
 * Reading the email: Mailpit's UI and API answer on :8025 behind the service —
 *   kubectl -n constructive-platform-default port-forward svc/mailpit-svc 8025:8025
 *
 * Prerequisites checked fail-loud: the email-sender module's physical tables
 * for this database scope (a warm tenant can predate them — the #3861 family),
 * and the site's canonical_url (every emailed link is built on it).
 *
 * Idempotent — every write is a set-over-row keyed by name / is_default.
 */

import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as dotenv from 'dotenv';

const MODULE_DIR = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(MODULE_DIR, '../../../.env') });

const env = process.env;
const DATABASE_ID = env.DATABASE_ID ?? '';
if (!DATABASE_ID) throw new Error('DATABASE_ID is required — run local:bringup first');

const PGHOST = env.PGHOST ?? 'localhost';
const PGPORT = env.PGPORT ?? '15432';
const PGDATABASE = env.PGDATABASE ?? 'constructive-functions-db1';
const psqlBase = ['-h', PGHOST, '-p', PGPORT, '-U', env.PGUSER ?? 'postgres', '-d', PGDATABASE];

// The local sender. The address must be FQDN-shaped (the identities table's
// CHECK rejects a dotless domain), so the default uses the reserved .test
// TLD; Mailpit accepts everything, and nothing real ever sees it.
const FROM_ADDRESS = (env.EMAIL_FROM_ADDRESS ?? 'no-reply@localhost.test').toLowerCase();
const FROM_NAME = env.EMAIL_FROM_NAME ?? 'Constructive Local';
const SUPPORT_ADDRESS = env.EMAIL_SUPPORT_ADDRESS ?? null;
if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(FROM_ADDRESS)) {
  throw new Error(`EMAIL_FROM_ADDRESS '${FROM_ADDRESS}' is not an FQDN-shaped email address`);
}

/** Quote one env-derived value for the single-quoted SQL literals below. */
const esc = (value: string): string => value.replace(/'/g, "''");

/** One psql -Atc scalar (or empty string), so a missing fact fails by shape. */
const scalar = (sql: string): string =>
  execFileSync('psql', [...psqlBase, '-Atc', sql], { encoding: 'utf8' }).trim();

/** One psql statement, failing loudly on the first error. */
const run = (sql: string): void => {
  execFileSync('psql', [...psqlBase, '-v', 'ON_ERROR_STOP=1', '-c', sql], {
    stdio: ['ignore', 'inherit', 'inherit']
  });
};

async function main(): Promise<void> {
  console.log(`tenant ${DATABASE_ID}: configuring the email lane (smtp → in-cluster Mailpit)`);

  // ---- 1. The email-sender module's row for this database scope. ----
  // Same resolution the module loader performs (EMAIL_SENDER_MODULE_SQL):
  // the scope prefixes its tables, so the generated row is the fact. A warm
  // tenant can predate the row (the #3861 family), so heal it the way
  // local-bringup's store-fix does: INSERT the database-scope row pointing at
  // the SHARED routing_public tables every scope reads (the loader always
  // binds the platform instance's tables and filters by the scope key).
  const resolveModule = (): string =>
    scalar(`
      SELECT ps.schema_name || ';' || coalesce(accounts_t.name, '') || ';' || coalesce(identities_t.name, '')
        FROM metaschema_modules_public.email_sender_module esm
        LEFT JOIN metaschema_public.schema ps ON ps.id = esm.schema_id
        LEFT JOIN metaschema_public.table accounts_t
          ON accounts_t.id = esm.email_provider_accounts_table_id
         AND esm.email_provider_accounts_table_id <> uuid_nil()
        LEFT JOIN metaschema_public.table identities_t
          ON identities_t.id = esm.email_identities_table_id
         AND esm.email_identities_table_id <> uuid_nil()
       WHERE esm.database_id = '${DATABASE_ID}'::uuid
         AND esm.scope = 'database'`);
  let moduleRow = resolveModule();
  if (!moduleRow || moduleRow.split(';').some((part) => !part)) {
    // The module table's insert trigger demands the super-constructive GUC for
    // database-scope rows — the same three set_config statements
    // local-bringup's store-fix opens with, in the SAME session as the INSERT.
    run(`
      SELECT set_config('constructive.allow_super_constructive','true',false);
      SELECT set_config('jwt.strict_attribution','false',false);
      SELECT set_config('jwt.claims.database_id','${DATABASE_ID}',false);
      INSERT INTO metaschema_modules_public.email_sender_module (
        database_id, entity_field, schema_id, public_schema_name,
        email_provider_accounts_table_id, email_identities_table_id, email_site_identities_table_id,
        email_provider_accounts_table_name, email_identities_table_name, email_site_identities_table_name,
        site_surface_module_id, scope, prefix, default_capabilities
      )
      SELECT '${DATABASE_ID}'::uuid, 'database_id', s.id, 'routing_public',
             ta.id, ti.id, ts.id,
             'email_provider_accounts', 'email_identities', 'email_site_identities',
             (SELECT id FROM metaschema_modules_public.site_surface_module
               WHERE database_id = '${DATABASE_ID}'::uuid AND scope = 'database' LIMIT 1),
             'database', '', '{}'
        FROM metaschema_public.schema s
        JOIN metaschema_public.table ta ON ta.name = 'email_provider_accounts' AND ta.schema_id = s.id
        JOIN metaschema_public.table ti ON ti.name = 'email_identities' AND ti.schema_id = s.id
        LEFT JOIN metaschema_public.table ts ON ts.name = 'email_site_identities' AND ts.schema_id = s.id
       WHERE s.schema_name = 'routing_public'
         AND NOT EXISTS (SELECT 1 FROM metaschema_modules_public.email_sender_module
                          WHERE database_id = '${DATABASE_ID}'::uuid AND scope = 'database')`);
    moduleRow = resolveModule();
  }
  const [publicSchema, accountsTable, identitiesTable] = moduleRow.split(';');
  if (!publicSchema || !accountsTable || !identitiesTable) {
    throw new Error(
      `no database-scope email_sender_module row (or half-provisioned: ` +
        `'${moduleRow.replace(/;/g, '|')}') for tenant ${DATABASE_ID} — ` +
        'the self-heal INSERT matched nothing; check routing_public tables exist'
    );
  }
  console.log(`module: ${publicSchema}.${accountsTable} + ${identitiesTable}`);

  // ---- 2. Provider account + default identity (one idempotent block). ----
  const accountName = 'local-mailpit';
  const smtpHost = env.MAILPIT_SMTP_HOST ?? 'mailpit-svc.constructive-platform-default.svc.cluster.local';
  const smtpPort = env.MAILPIT_SMTP_PORT ?? '1025';
  run(`
    DO $$
    DECLARE
      v_account_id uuid;
    BEGIN
      SELECT id INTO v_account_id
        FROM "${publicSchema}"."${accountsTable}"
       WHERE database_id = '${DATABASE_ID}'::uuid AND name = '${accountName}';
      IF v_account_id IS NULL THEN
        INSERT INTO "${publicSchema}"."${accountsTable}" (
          id, created_at, updated_at, name, provider, provider_account_name,
          smtp_host, smtp_port, smtp_secure, smtp_user, credentials_secret_name,
          webhook_signing_secret_name, is_active, database_id
        ) VALUES (
          gen_random_uuid(), now(), now(), '${accountName}', 'smtp', 'mailpit.local',
          '${smtpHost}', ${smtpPort}, false, NULL, 'SMTP_PASS',
          NULL, true, '${DATABASE_ID}'
        ) RETURNING id INTO v_account_id;
      ELSE
        UPDATE "${publicSchema}"."${accountsTable}"
           SET updated_at = now(), provider = 'smtp',
               smtp_host = '${smtpHost}', smtp_port = ${smtpPort},
               smtp_secure = false, smtp_user = NULL,
               credentials_secret_name = 'SMTP_PASS', is_active = true
         WHERE id = v_account_id;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM "${publicSchema}"."${identitiesTable}"
                      WHERE database_id = '${DATABASE_ID}'::uuid AND is_default) THEN
        INSERT INTO "${publicSchema}"."${identitiesTable}" (
          id, created_at, updated_at, name, provider_account_id, transport_mode,
          from_address, from_name, reply_to_address, support_address,
          is_default, is_active, database_id
        ) VALUES (
          gen_random_uuid(), now(), now(), 'transactional', v_account_id, 'own',
          '${esc(FROM_ADDRESS)}', '${esc(FROM_NAME)}', NULL,
          ${SUPPORT_ADDRESS ? `'${esc(SUPPORT_ADDRESS)}'` : 'NULL'},
          true, true, '${DATABASE_ID}'
        );
      ELSE
        UPDATE "${publicSchema}"."${identitiesTable}"
           SET updated_at = now(), provider_account_id = v_account_id,
               transport_mode = 'own', from_address = '${esc(FROM_ADDRESS)}',
               from_name = '${esc(FROM_NAME)}', is_active = true
         WHERE database_id = '${DATABASE_ID}'::uuid AND is_default;
      END IF;
    END $$;`);
  console.log(`sender: ${FROM_ADDRESS} via ${accountName} (${smtpHost}:${smtpPort})`);

  // ---- 3. Every emailed link is built on the site's canonical_url. ----
  const canonical = scalar(`
    SELECT coalesce(max(canonical_url)::text, '')
      FROM routing_public.site_metadata WHERE database_id = '${DATABASE_ID}'::uuid`);
  if (!canonical) {
    throw new Error(
      `no canonical_url in routing_public.site_metadata for tenant ${DATABASE_ID} — ` +
        'run ensure-site first; the email function refuses to build links without it'
    );
  }
  console.log(`site: links build on ${canonical}`);

  // ---- 4. Auth flips (setup window measured from owner bootstrap, #3765). ----
  const authSchema = scalar(`
    SELECT s.schema_name FROM routing_public.rls_settings rs
       JOIN metaschema_public.schema s ON s.id = rs.authenticate_schema_id
      WHERE rs.database_id = '${DATABASE_ID}'::uuid`);
  run(`
    UPDATE "${authSchema}".app_settings_auth
       SET allow_magic_link_sign_in = true,
           allow_magic_link_sign_up = true,
           enforce_primary_auth_method = false`);
  console.log(
    `auth: allow_magic_link_sign_in/sign_up = true, enforce_primary_auth_method = false ` +
      `on ${authSchema}.app_settings_auth`
  );

  console.log(
    'email lane configured — read the mailbox: ' +
      'kubectl -n constructive-platform-default port-forward svc/mailpit-svc 8025:8025 → http://localhost:8025'
  );
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? (err.stack ?? err.message) || String(err) : String(err));
  process.exit(1);
});
