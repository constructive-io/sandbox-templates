/**
 * configure-email — who the tenant's mail leaves as: the in-cluster Mailpit
 * (its UI on :18025 is the local mailbox).
 *
 * The `email` function refuses to send for a tenant that recorded no sender
 * ("configured" is a row, never an inherited default). A hosted tenant
 * installs no email module of its own: its sender sits in the platform's
 * database-scope email plane, keyed by the tenant (compute/runtimes/node/src/
 * email.ts resolves it there; upstream's setEmailSender writes it the same
 * way, compute/testkit/test-utils/src/email.ts). Two rows, written as the
 * owner's platform session:
 *
 *   1. a provider account: smtp to the in-cluster `mailpit-svc` (the :11025
 *      forward is the host's, pods reach the service), no AUTH user, so the
 *      credential it names (SMTP_PASS, one the function declares) is never read;
 *   2. the default identity: from address + name, sending through that account.
 *
 * Idempotent: both rows are upserted by (tenant, name).
 */

import { Client } from 'pg';

import { env, pgConfig, required } from './env.js';
import { asSession, platformSession } from './realm.js';

const DATABASE_ID = required('DATABASE_ID');
const FROM_ADDRESS = env.EMAIL_FROM_ADDRESS ?? 'no-reply@myapp.local';
const FROM_NAME = env.EMAIL_FROM_NAME ?? env.DATABASE_NAME ?? 'myapp';
const MAILPIT_SMTP_HOST = env.MAILPIT_SMTP_HOST ?? 'mailpit-svc.constructive-platform-default.svc.cluster.local';
const MAILPIT_SMTP_PORT = Number(env.MAILPIT_SMTP_PORT ?? 1025);

async function main(): Promise<void> {
  const client = new Client(pgConfig);
  await client.connect();
  const owner = await platformSession(client);

  // The plane's physical names and scope-key column are recorded on its
  // module row, never derived from the scope.
  const { rows } = await client.query(
    `SELECT s.schema_name, m.email_provider_accounts_table_name AS accounts,
            m.email_identities_table_name AS identities, m.entity_field
       FROM metaschema_modules_public.email_sender_module m
       JOIN metaschema_public.schema s ON s.id = m.schema_id
      WHERE m.database_id = $1 AND m.scope = 'database'`,
    [owner.databaseId]
  );
  const plane = rows[0] as
    | { schema_name: string; accounts: string; identities: string; entity_field: string | null }
    | undefined;
  if (!plane?.entity_field) {
    throw new Error("the platform has no database-scope email_sender_module keyed by tenant — is the platform up?");
  }
  const table = (name: string) => `${client.escapeIdentifier(plane.schema_name)}.${client.escapeIdentifier(name)}`;
  const key = client.escapeIdentifier(plane.entity_field);

  await asSession(client, owner, owner.databaseId, async () => {
    await client.query(
      `INSERT INTO ${table(plane.accounts)}
         (${key}, name, provider, smtp_host, smtp_port, smtp_secure, smtp_user, credentials_secret_name)
       VALUES ($1, 'mailpit', 'smtp', $2, $3, false, NULL, 'SMTP_PASS')
       ON CONFLICT (${key}, name) DO UPDATE SET
         smtp_host = EXCLUDED.smtp_host, smtp_port = EXCLUDED.smtp_port, smtp_secure = EXCLUDED.smtp_secure,
         smtp_user = EXCLUDED.smtp_user, credentials_secret_name = EXCLUDED.credentials_secret_name,
         is_active = true, updated_at = now()`,
      [DATABASE_ID, MAILPIT_SMTP_HOST, MAILPIT_SMTP_PORT]
    );
    await client.query(
      `INSERT INTO ${table(plane.identities)}
         (${key}, name, provider_account_id, transport_mode, from_address, from_name, is_default)
       SELECT $1, 'default', a.id, 'own', $2, $3, true
         FROM ${table(plane.accounts)} a WHERE a.${key} = $1 AND a.name = 'mailpit'
       ON CONFLICT (${key}, name) DO UPDATE SET
         provider_account_id = EXCLUDED.provider_account_id, from_address = EXCLUDED.from_address,
         from_name = EXCLUDED.from_name, is_default = true, is_active = true, updated_at = now()`,
      [DATABASE_ID, FROM_ADDRESS, FROM_NAME]
    );
  });
  console.log(
    `email: '${FROM_ADDRESS}' (${FROM_NAME}) via ${MAILPIT_SMTP_HOST}:${MAILPIT_SMTP_PORT}, ` +
      `in the platform's database-scope plane (${plane.schema_name}) — mailbox http://localhost:18025`
  );

  await client.end();
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? (err.stack ?? err.message) : String(err));
  process.exit(1);
});
