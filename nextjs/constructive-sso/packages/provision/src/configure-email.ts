/**
 * configure-email — give the provisioned tenant an outbound sender, pointed at
 * the platform's in-cluster Mailpit (UI :18025 IS the local mailbox).
 *
 * The `email` cloud function refuses to send for a tenant that configured no
 * identity ("configured" is a row, never an inherited default), and a fresh
 * tenant has none. What it reads is generated data:
 *
 *   1. `email_sender_module` at database scope — one INSERT; the module's
 *      insert trigger generates the schema (`<pool>-email-public`) and the
 *      provider-account / identity tables. Idempotent on
 *      (database_id, scope).
 *   2. A provider account row: provider 'smtp', host the in-cluster
 *      `mailpit-svc` (ports 11025/18025 are host-side forwards only — pods
 *      reach the service, not the forward), no AUTH (Mailpit takes none, so
 *      the credentials secret needs no value; its name must still be one the
 *      function DECLARES — 'SMTP_PASS').
 *   3. An identity row: from address + name, `transport_mode 'own'`,
 *      `is_default` — the scope's default identity every non-site-scoped
 *      send resolves.
 *
 * Also self-heals the two internal store modules (`internal_config_module`,
 * `internal_secrets_module`) at database scope: a fresh tenant has only the
 * 'app'-scope rows, and any later `fun config|secrets --scope database` (this
 * bring-up's configure-sms) refuses until they exist. Idempotent inserts.
 *
 * Idempotent — every verb is an upsert-or-skip. The module installs need the
 * super-constructive GUC; this script runs as the platform superuser via psql.
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
const PGUSER = env.PGUSER ?? 'postgres';

// Who mail leaves as. Falls back to the tenant's own name — a local dev
// mailbox cares that the row exists, not that the address resolves.
const FROM_ADDRESS = env.EMAIL_FROM_ADDRESS ?? 'no-reply@myapp.local';
const FROM_NAME = env.EMAIL_FROM_NAME ?? env.DATABASE_NAME ?? 'myapp';

/** The Mailpit relay as a pod reaches it: the in-cluster service, not the
 * host-side port-forward (11025/18025 are for the developer's machine). */
const MAILPIT_SMTP_HOST = env.MAILPIT_SMTP_HOST ?? 'mailpit-svc.constructive-platform-default.svc.cluster.local';
const MAILPIT_SMTP_PORT = env.MAILPIT_SMTP_PORT ?? '1025';

const psql = (sql: string): string =>
  execFileSync(
    'psql',
    ['-h', PGHOST, '-p', PGPORT, '-U', PGUSER, '-d', PGDATABASE, '-Atc', sql],
    { encoding: 'utf-8', env: { ...env, PGPASSWORD: env.PGPASSWORD ?? 'password' } }
  ).trim();

const psqlRun = (sql: string): void => {
  execFileSync(
    'psql',
    ['-h', PGHOST, '-p', PGPORT, '-U', PGUSER, '-d', PGDATABASE, '-v', 'ON_ERROR_STOP=1', '-c', sql],
    { stdio: ['ignore', 'inherit', 'inherit'], env: { ...env, PGPASSWORD: env.PGPASSWORD ?? 'password' } }
  );
};

async function main(): Promise<void> {
  console.log(`tenant ${DATABASE_ID}: configuring the email lane (smtp -> Mailpit)`);

  // ---- 0. Self-heal the internal store modules a fresh tenant lacks. ----
  // Everything else on this bring-up that writes tenant-scoped config or
  // secrets (configure-sms, the fun CLI) needs these two rows at database
  // scope; a fresh tenant ships only the 'app'-scope pair.
  // NB: WHERE NOT EXISTS, not ON CONFLICT — these module tables carry no
  // unique constraint, so a bare INSERT would re-run the install trigger and
  // die generating already-existing tables.
  psqlRun(`
    SET constructive.allow_super_constructive = 'true';
    INSERT INTO metaschema_modules_public.internal_config_module (database_id, scope)
    SELECT '${DATABASE_ID}'::uuid, 'database'
     WHERE NOT EXISTS (SELECT 1 FROM metaschema_modules_public.internal_config_module
                        WHERE database_id = '${DATABASE_ID}'::uuid AND scope = 'database');
    INSERT INTO metaschema_modules_public.internal_secrets_module (database_id, scope)
    SELECT '${DATABASE_ID}'::uuid, 'database'
     WHERE NOT EXISTS (SELECT 1 FROM metaschema_modules_public.internal_secrets_module
                        WHERE database_id = '${DATABASE_ID}'::uuid AND scope = 'database');`);
  console.log('modules: internal_config_module + internal_secrets_module ensured at database scope');

  // ---- 1. The email sender module (its trigger generates the tables). ----
  psqlRun(`
    SET constructive.allow_super_constructive = 'true';
    INSERT INTO metaschema_modules_public.email_sender_module (database_id, scope)
    VALUES ('${DATABASE_ID}'::uuid, 'database') ON CONFLICT DO NOTHING;`);

  // The generated physical names, read back from the module row — never
  // guessed: a scope prefixes its tables and the row is the recorded fact.
  const { schema, accountsTable, identitiesTable } = JSON.parse(
    psql(`
      SELECT jsonb_build_object(
        'schema', s.schema_name,
        'accountsTable', m.email_provider_accounts_table_name,
        'identitiesTable', m.email_identities_table_name)
      FROM metaschema_modules_public.email_sender_module m
      JOIN metaschema_public.schema s ON s.id = m.schema_id
      WHERE m.database_id = '${DATABASE_ID}'::uuid AND m.scope = 'database'`) || '{}'
  ) as { schema: string; accountsTable: string; identitiesTable: string };
  if (!schema || !accountsTable || !identitiesTable) {
    throw new Error('email_sender_module row did not resolve its generated tables');
  }

  // ---- 2. The provider account (smtp -> in-cluster Mailpit, no AUTH). ----
  psqlRun(`
    INSERT INTO "${schema}"."${accountsTable}"
      (name, provider, smtp_host, smtp_port, smtp_secure, smtp_user,
       credentials_secret_name, database_id)
    VALUES
      ('mailpit', 'smtp', '${MAILPIT_SMTP_HOST}', ${MAILPIT_SMTP_PORT}, false, NULL,
       'SMTP_PASS', '${DATABASE_ID}'::uuid)
    ON CONFLICT (database_id, name) DO UPDATE
      SET smtp_host = EXCLUDED.smtp_host, smtp_port = EXCLUDED.smtp_port,
          smtp_secure = EXCLUDED.smtp_secure, smtp_user = EXCLUDED.smtp_user,
          credentials_secret_name = EXCLUDED.credentials_secret_name,
          is_active = true, updated_at = now();`);

  // ---- 3. The default identity every send resolves. ----
  psqlRun(`
    INSERT INTO "${schema}"."${identitiesTable}"
      (name, provider_account_id, transport_mode, from_address, from_name, is_default, database_id)
    SELECT 'default', a.id, 'own', '${FROM_ADDRESS}', '${FROM_NAME}', true, '${DATABASE_ID}'::uuid
      FROM "${schema}"."${accountsTable}" a
     WHERE a.database_id = '${DATABASE_ID}'::uuid AND a.name = 'mailpit'
    ON CONFLICT (database_id, name) DO UPDATE
      SET from_address = EXCLUDED.from_address, from_name = EXCLUDED.from_name,
          is_default = true, is_active = true, updated_at = now();`);

  // ---- 4. The emailed-link sign-in lane this mailbox serves. ----
  // A link that signs in is mail the tenant sends, so the lane's switch
  // belongs beside the sender it depends on; it rides the owner-bootstrap
  // setup window like every auth toggle this bring-up touches.
  const authSchema = psql(`
    SELECT s.schema_name FROM routing_public.rls_settings rs
      JOIN metaschema_public.schema s ON s.id = rs.authenticate_schema_id
     WHERE rs.database_id = '${DATABASE_ID}'::uuid`);
  psqlRun(`
    UPDATE "${authSchema}".app_settings_auth
       SET allow_magic_link_sign_in = true,
           allow_magic_link_sign_up = true`);
  console.log('auth: magic-link sign-in + sign-up on (the email lane this mailbox serves)');

  console.log(
    `email: identity '${FROM_ADDRESS}' (${FROM_NAME}) via ${MAILPIT_SMTP_HOST}:${MAILPIT_SMTP_PORT} — ` +
      'Mailpit at http://localhost:18025 is the mailbox'
  );
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? (err.stack ?? err.message) || String(err) : String(err));
  process.exit(1);
});
