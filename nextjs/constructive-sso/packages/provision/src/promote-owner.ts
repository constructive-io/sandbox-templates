/**
 * promote-owner — make the first SSO-signed-in user the tenant's owner.
 *
 * A pool-baked tenant's only owner is the copied-in platform bootstrap user.
 * The first real user arrives via SSO: `sso:callback`'s sign-up creates the
 * user + identity + session, and the users-table trigger creates their
 * app_memberships row — but with zero capabilities and not
 * active/approved/verified. Every admin mutation (create organization, …)
 * is RLS-gated on a manage-users capability the row lacks, so the app is a
 * dead end until someone promotes the user.
 *
 * This mirrors what the platform's own `bootstrap_owner_into_database` does
 * for the bootstrap owner (is_admin/is_owner + full capabilities), and —
 * because the generated `sign_up_identity` does not populate them — also
 * fills users.display_name / username from the identity profile the SSO
 * callback parked in connected_accounts.details.
 *
 * Run once after the first Google sign-in (idempotent):
 *   pnpm run promote-owner            # newest human user
 *   PROMOTE_OWNER_EMAIL=you@x pnpm run promote-owner
 */

import { resolve } from 'node:path';

import * as dotenv from 'dotenv';
import { Client } from 'pg';

// Load the boilerplate root's .env (pnpm runs from packages/provision/).
dotenv.config({ path: resolve(process.cwd(), '../../.env') });

const env = process.env;

const BOOTSTRAP_USER_ID = '00000000-0000-0000-0000-000000000003';

const required = (name: string): string => {
  const value = env[name];
  if (!value) throw new Error(`missing ${name} in the environment`);
  return value;
};

async function main(): Promise<void> {
  const DATABASE_ID = required('DATABASE_ID');
  const client = new Client({
    host: env.PGHOST ?? 'localhost',
    port: Number(env.PGPORT ?? 15432),
    database: env.PGDATABASE ?? 'constructive-functions-db1',
    user: env.PGUSER ?? 'postgres',
    password: env.PGPASSWORD ?? 'password',
  });
  await client.connect();

  // The tenant's physical schema prefix, resolved the same way configure-sso
  // does (from the identity module row) — never assumed.
  const identityModule = await client.query(
    `SELECT s.schema_name
     FROM metaschema_modules_public.identity_providers_module ipm
     JOIN metaschema_public.schema s ON s.id = ipm.private_schema_id
     WHERE ipm.database_id = $1 LIMIT 1`,
    [DATABASE_ID]
  );
  if (identityModule.rowCount === 0) throw new Error(`no identity module for database ${DATABASE_ID}`);
  const prefix = ((identityModule.rows[0] as { schema_name: string }).schema_name
    .split('-').slice(0, 3).join('-'));
  const usersTable = `"${prefix}-users-public".users`;
  const membershipsTable = `"${prefix}-memberships-public".app_memberships`;
  const emailsTable = `"${prefix}-user-identifiers-public".emails`;
  const connectedTable = `"${prefix}-user-identifiers-private".connected_accounts`;

  // 1. Pick the user to promote: the address named by PROMOTE_OWNER_EMAIL, or
  //    the newest human user that is not the platform bootstrap copy.
  let userId: string | null = null;
  let displayName: string | null = null;
  let email: string | null = env.PROMOTE_OWNER_EMAIL ?? null;
  if (email) {
    const byEmail = await client.query(
      `SELECT u.id, u.display_name FROM ${usersTable} u
       JOIN ${emailsTable} e ON e.owner_id = u.id
       WHERE e.email = $1 LIMIT 1`,
      [email]
    );
    if (byEmail.rows.length === 0) throw new Error(`no user with email ${email}`);
    userId = (byEmail.rows[0] as { id: string }).id;
    displayName = ((byEmail.rows[0] as { display_name: string | null }).display_name) ?? null;
  } else {
    const newest = await client.query(
      `SELECT u.id, u.display_name, e.email FROM ${usersTable} u
       LEFT JOIN ${emailsTable} e ON e.owner_id = u.id AND e.is_primary
       WHERE u.type = 1 AND u.id <> $1 ORDER BY u.created_at DESC LIMIT 1`,
      [BOOTSTRAP_USER_ID]
    );
    if (newest.rows.length === 0) throw new Error('no human user to promote — sign in with Google first');
    userId = (newest.rows[0] as { id: string }).id;
    displayName = ((newest.rows[0] as { display_name: string | null }).display_name) ?? null;
    email = ((newest.rows[0] as { email: string | null }).email) ?? null;
  }

  // 2. The SSO callback parks the provider profile in connected_accounts
  //    details; sign_up_identity does not copy name/picture into users, so
  //    heal display_name from there (only where still empty). The username
  //    follows the platform's own owner-bootstrap convention — the email's
  //    local part (that is what the UI renders as the @handle) — and is set
  //    unconditionally so a re-run corrects an earlier value.
  const profile = await client.query(
    `SELECT details->>'name' AS name, details->>'picture' AS picture
     FROM ${connectedTable} WHERE owner_id = $1 AND service = 'google' LIMIT 1`,
    [userId]
  );
  const profileName = profile.rows.length > 0 ? ((profile.rows[0] as { name: string | null }).name ?? null) : null;
  const name = displayName ?? profileName;
  const localPart = email ? email.split('@')[0] : null;
  await client.query(
    `UPDATE ${usersTable} SET
       display_name = COALESCE(display_name, $2),
       username = COALESCE($3, $4)
     WHERE id = $1`,
    [
      userId,
      name,
      localPart,
      name?.toLowerCase().replace(/[^a-z0-9_.-]+/g, '-').replace(/^-+|-+$/g, '') ?? null,
    ]
  );

  // 3. Promote the membership the users-table trigger already created: the
  //    same flags + full capability set bootstrap_owner_into_database grants.
  const promoted = await client.query(
    `UPDATE ${membershipsTable} SET
       is_owner = TRUE,
       is_admin = TRUE,
       is_active = TRUE,
       is_approved = TRUE,
       is_verified = TRUE,
       capabilities = lpad('1', 64, '1')::bit(64)
     WHERE actor_id = $1
     RETURNING actor_id`,
    [userId]
  );
  if (promoted.rowCount === 0) {
    throw new Error(`no app_memberships row for ${userId} — the users-table trigger did not run for this user`);
  }

  console.log(`user ${userId} promoted to owner (username: ${localPart ?? '(none)'}, display_name: ${name ?? '(none)'})`);
  console.log('  organization creation and every admin surface are now open to this user');

  await client.end();
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? (err.stack ?? err.message) || String(err) : String(err));
  process.exit(1);
});
