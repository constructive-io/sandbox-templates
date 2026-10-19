/**
 * configure-sso — the tenant's identity provider (a real Google OAuth app from
 * OAUTH_* in .env), written the way upstream's setIdentityProvider writes it
 * (compute/testkit/test-utils/src/identity-providers.ts):
 *
 *   - the provider row in the identity_providers module's PRIVATE table (the
 *     auth API exposes only slug/kind/display_name/enabled), as the owner's
 *     tenant session — the table's guard_step_up refuses an UPDATE from a
 *     caller with no recent verification, and a fresh password sign-in is one;
 *   - the client secret through rotate_identity_provider_<prefix>_secret, which
 *     encrypts it into the tenant's internal secrets and points
 *     client_secret_id at it (a row written beside it reads as not configured).
 *
 * The sign-in switches and cookie policy the provider legs read are in
 * configure-auth. The tenant's grants are the generated ones: a b2b:storage
 * bake grants `anonymous` every function the signed-out pages call
 * (current_user, the OAuth request pair, sign_out, ...), so this step grants
 * nothing (the old anonymous-grant pass for planning#2122 is gone).
 */

import { Client } from 'pg';

import { env, pgConfig, required } from './env.js';
import { asSession, tenantSession } from './realm.js';

const DATABASE_ID = required('DATABASE_ID');

async function main(): Promise<void> {
  const slug = required('OAUTH_PROVIDER');
  const provider = {
    kind: 'oidc',
    display_name: `Google (${slug})`,
    enabled: true,
    client_id: required('OAUTH_CLIENT_ID'),
    issuer_url: env.OAUTH_ISSUER_URL ?? 'https://accounts.google.com',
    authorization_url: required('OAUTH_AUTHORIZE_URL'),
    token_url: required('OAUTH_TOKEN_URL'),
    userinfo_url: required('OAUTH_USERINFO_URL'),
    scopes: (env.OAUTH_SCOPES ?? 'openid,email,profile').split(','),
    pkce_enabled: true,
    skip_nonce_check: false
  };
  const clientSecret = required('OAUTH_CLIENT_SECRET');

  const client = new Client(pgConfig);
  await client.connect();
  const owner = await tenantSession();

  await asSession(client, owner, DATABASE_ID, async () => {
    const mod = await client.query(
      `SELECT s.schema_name, t.name AS table_name, ipm.prefix, ipm.entity_field
         FROM metaschema_modules_public.identity_providers_module ipm
         JOIN metaschema_public.schema s ON s.id = ipm.private_schema_id
         JOIN metaschema_public.table t ON t.id = ipm.table_id
        WHERE ipm.database_id = $1`,
      [DATABASE_ID]
    );
    if (mod.rowCount !== 1) {
      throw new Error(`tenant ${DATABASE_ID} has ${mod.rowCount} identity_providers modules, not one`);
    }
    const { schema_name, table_name, prefix, entity_field } = mod.rows[0] as {
      schema_name: string;
      table_name: string;
      prefix: string;
      entity_field: string | null;
    };
    const table = `${client.escapeIdentifier(schema_name)}.${client.escapeIdentifier(table_name)}`;
    const columns = Object.keys(provider) as Array<keyof typeof provider>;
    const existing = await client.query(`SELECT id FROM ${table} WHERE slug = $1`, [slug]);
    let id: string;
    if (existing.rowCount) {
      id = (existing.rows[0] as { id: string }).id;
      await client.query(
        `UPDATE ${table} SET ${columns.map((c, i) => `${c} = $${i + 2}`).join(', ')} WHERE id = $1`,
        [id, ...columns.map((c) => provider[c])]
      );
    } else {
      const names: string[] = ['slug', ...columns, ...(entity_field ? [entity_field] : [])];
      const values: unknown[] = [slug, ...columns.map((c) => provider[c]), ...(entity_field ? [DATABASE_ID] : [])];
      const inserted = await client.query(
        `INSERT INTO ${table} (${names.map((n) => client.escapeIdentifier(n)).join(', ')})
         VALUES (${names.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING id`,
        values
      );
      id = (inserted.rows[0] as { id: string }).id;
    }
    const rotate = ['rotate_identity_provider', prefix, 'secret'].filter(Boolean).join('_');
    await client.query(`SELECT ${client.escapeIdentifier(schema_name)}.${client.escapeIdentifier(rotate)}($1, $2)`, [
      id,
      clientSecret
    ]);
    console.log(`provider '${slug}' configured (${schema_name}.${table_name}); client secret rotated via ${rotate}`);
  });

  await client.end();
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? (err.stack ?? err.message) : String(err));
  process.exit(1);
});
