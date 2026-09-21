/**
 * configure-sso — point the provisioned tenant's identity plane at a real
 * Google OAuth app and set the auth settings the SSO flow needs.
 *
 * Reads OAUTH_* from the environment (see .env.example), writes the provider
 * row + rotates the secret through the tenant's own procedure, and sets
 * app_settings_auth for the browser lane (host-only cookie, localhost HTTP).
 *
 * Parameterized throughout — credentials and endpoints travel as bind
 * values, never as interpolated SQL.
 */

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as dotenv from 'dotenv';
import { Client } from 'pg';

// Load the boilerplate root's .env so this works when run standalone via
// `pnpm run provision` — resolved from this module's location, not
// process.cwd() (src/ -> packages/provision/ -> packages/ -> project root).
const MODULE_DIR = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(MODULE_DIR, '../../../.env') });

const env = process.env;

const required = (name: string): string => {
  const value = env[name];
  if (!value) throw new Error(`missing ${name} in the environment`);
  return value;
};

// The physical coordinates of the provisioned tenant, resolved at runtime
// from the ticket (see provision.ts) — never guessed.
const DATABASE_ID = required('DATABASE_ID');
const PGHOST = env.PGHOST ?? 'localhost';
const PGPORT = Number(env.PGPORT ?? 15432);
const PGDATABASE = env.PGDATABASE ?? 'constructive-functions-db1';
const PGUSER = env.PGUSER ?? 'postgres';
const PGPASSWORD = env.PGPASSWORD ?? 'password';

// The tenant's identity module instance (pool-baked tenants carry the
// auth:hardened surface under a pool-* prefix; resolve it from the module
// row rather than assuming a name).
const IDENTITY_PROVIDERS_SQL = `
  SELECT s.schema_name AS private_schema_name, ipm.table_name
  FROM metaschema_modules_public.identity_providers_module ipm
  JOIN metaschema_public.schema s ON s.id = ipm.private_schema_id
  WHERE ipm.database_id = $1
  LIMIT 1
`;

// The auth settings table is resolved the way the runtime resolves it: the
// settings module's rls_settings row names the tenant's auth schema, and
// app_settings_auth lives there.
const APP_SETTINGS_AUTH_SQL = `
  SELECT s.schema_name
  FROM routing_public.rls_settings rs
  JOIN metaschema_public.schema s ON s.id = rs.authenticate_schema_id
  WHERE rs.database_id = $1
  LIMIT 1
`;

async function main(): Promise<void> {
  const client = new Client({ host: PGHOST, port: PGPORT, database: PGDATABASE, user: PGUSER, password: PGPASSWORD });
  await client.connect();

  const providerModule = await client.query(IDENTITY_PROVIDERS_SQL, [DATABASE_ID]);
  if (providerModule.rowCount === 0) {
    throw new Error(`no identity_providers_module instance for database ${DATABASE_ID} — provision the tenant first`);
  }
  const { private_schema_name: providerSchema, table_name: providersTable } = providerModule.rows[0] as {
    private_schema_name: string;
    table_name: string;
  };

  const settingsModule = await client.query(APP_SETTINGS_AUTH_SQL, [DATABASE_ID]);
  if (settingsModule.rowCount === 0) {
    throw new Error(`no rls_settings row for database ${DATABASE_ID}`);
  }
  const settingsSchema = (settingsModule.rows[0] as { schema_name: string }).schema_name;
  const settingsTable = 'app_settings_auth';

  const slug = required('OAUTH_PROVIDER');
  const clientId = required('OAUTH_CLIENT_ID');
  const clientSecret = required('OAUTH_CLIENT_SECRET');
  const authorizeUrl = required('OAUTH_AUTHORIZE_URL');
  const tokenUrl = required('OAUTH_TOKEN_URL');
  const userinfoUrl = required('OAUTH_USERINFO_URL');
  // The issuer the provider row records. Defaults to Google; a local OIDC
  // emulator is just a row — override this with its origin and it serves the
  // same flow (its endpoints travel through the OAUTH_*_URL knobs above).
  const issuerUrl = env.OAUTH_ISSUER_URL ?? 'https://accounts.google.com';
  const scopes = (env.OAUTH_SCOPES ?? 'openid,email,profile').split(',');

  // Provider row: upsert by slug so re-running provision is idempotent.
  // Columns track upstream's current identity_providers shape (the old
  // wire-knob columns — token_request_content_type, token_endpoint_auth_method,
  // userinfo_method, extra_token_params — are gone from main; the runtime now
  // speaks the standard exchange and reads only extra_authorization_params).
  const upsertProvider = `
    INSERT INTO "${providerSchema}"."${providersTable}"
      (slug, kind, display_name, enabled, client_id, issuer_url, authorization_url,
       token_url, userinfo_url, scopes, pkce_enabled, skip_nonce_check)
    VALUES ($1, 'oidc', $2, true, $3, $8, $4, $5, $6, $7, true, false)
    ON CONFLICT (slug) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      enabled = true,
      client_id = EXCLUDED.client_id,
      issuer_url = EXCLUDED.issuer_url,
      authorization_url = EXCLUDED.authorization_url,
      token_url = EXCLUDED.token_url,
      userinfo_url = EXCLUDED.userinfo_url,
      scopes = EXCLUDED.scopes,
      pkce_enabled = true,
      skip_nonce_check = false
  `;
  await client.query(upsertProvider, [slug, `Google (${slug})`, clientId, authorizeUrl, tokenUrl, userinfoUrl, scopes, issuerUrl]);

  // Secret rotation through the tenant's own procedure: the value lands in
  // the tenant's encrypted secret store, never in this script or config.
  const provider = await client.query(
    `SELECT id FROM "${providerSchema}"."${providersTable}" WHERE slug = $1`,
    [slug]
  );
  if (provider.rowCount === 0) {
    throw new Error(`provider '${slug}' not found after upsert`);
  }
  const providerId = (provider.rows[0] as { id: string }).id;
  await client.query(
    `SELECT "${providerSchema}".rotate_identity_provider_app_secret($1, $2)`,
    [providerId, clientSecret]
  );

  // Auth settings for the browser lane: host-only cookie (no Domain — the
  // app and the gateway share the `localhost` host across ports), plain HTTP
  // only in this local environment, errors land on the app's login page.
  const upsertSettings = `
    UPDATE "${settingsSchema}"."${settingsTable}" SET
      allow_identity_sign_in = true,
      allow_identity_sign_up = true,
      oauth_require_verified_email = true,
      oauth_error_redirect_path = '/login',
      cookie_domain = NULL,
      cookie_secure = false,
      cookie_samesite = 'lax'
  `;
  await client.query(upsertSettings);

  // The sign-in lane runs as the `anonymous` role (the sync gateway's default
  // for a request without a credential). Pool-baked tenants carry no anonymous
  // grants, so the lane would fail at the first procedure call.
  //
  // The grant set mirrors what the platform module ships for the same lane:
  // USAGE on the tenant's schemas, EXECUTE on the auth procedures the lane
  // calls — an explicit list, because upstream grants anonymous per procedure,
  // never by wildcard — and no table privileges at all. An earlier version of
  // this block granted DML on every table and EXECUTE on every function in
  // every prefixed schema, so this pass first strips everything anonymous
  // holds in the tenant (REVOKE ... IN SCHEMA) and then applies the narrow
  // set — re-running the script on such a tenant heals it.
  //
  // A DO block cannot take bind parameters, so the (trusted, DB-derived)
  // schema prefix is interpolated directly — single quotes escaped defensively.
  // The tenant's prefix is naming-convention-dependent (pool-baked tenants
  // use pool-<a>-<b>-…, direct ones <name>-<hash>-…): strip the known
  // -auth-private suffix instead of counting dash segments.
  const prefix = providerSchema.replace(/-auth-private$/, '');
  const esc = (s: string): string => s.replace(/'/g, "''");
  const likeAll = esc(`${prefix}-%`);
  const authPublic = esc(`${prefix}-auth-public`);
  const authPrivate = esc(`${prefix}-auth-private`);
  // The sign-in lane's procedures, by name: password/token/SMS/identity
  // sign-in and sign-up, session helpers the runtime resolves on every
  // request (current_user*), the OAuth start/callback pair, and the link
  // tickets the SSO callback may mint and spend. The auth schemas hold
  // admin-surface procedures too (rotate_identity_provider_app_secret,
  // principal and credential management), which is exactly why the grant is
  // a name list and not everything-in-schema: a lane added later fails
  // closed until its procedure is named here.
  const lane = [
    'authenticate',
    'authenticate_strict',
    'complete_mfa_challenge',
    'consume_app_oauth_request',
    'consume_app_pending_identity_link',
    'create_app_pending_identity_link',
    'current_ip_address',
    'current_user',
    'current_user_agent',
    'current_user_id',
    'forgot_password',
    'link_identity',
    'refresh_access_token',
    'request_magic_link',
    'reset_password',
    'send_sms_otp',
    'sign_in',
    'sign_in_cross_origin',
    'sign_in_identity',
    'sign_in_magic_link',
    'sign_in_sms_otp',
    'sign_out',
    'sign_up',
    'sign_up_identity',
    'sign_up_magic_link',
    'sign_up_sms',
    'start_app_oauth_request',
    'verify_email',
    'verify_idp',
    'verify_totp'
  ].map(esc);
  await client.query(`
    DO $$
    DECLARE
      s record;
      f record;
    BEGIN
      FOR s IN
        SELECT nspname AS schema FROM pg_namespace WHERE nspname LIKE '${likeAll}'
      LOOP
        EXECUTE format('REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA %I FROM anonymous', s.schema);
        EXECUTE format('REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA %I FROM anonymous', s.schema);
        EXECUTE format('REVOKE ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA %I FROM anonymous', s.schema);
        EXECUTE format('GRANT USAGE ON SCHEMA %I TO anonymous', s.schema);
      END LOOP;
      FOR f IN
        SELECT n.nspname AS s, p.proname AS f, pg_get_function_identity_arguments(p.oid) AS args
        FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname IN ('${authPublic}', '${authPrivate}')
          AND p.proname = ANY (ARRAY['${lane.join("','")}']::name[])
      LOOP
        EXECUTE format('GRANT EXECUTE ON FUNCTION %I.%I(%s) TO anonymous', f.s, f.f, f.args);
      END LOOP;
    END $$;
  `);

  console.log(`SSO provider '${slug}' configured on tenant ${DATABASE_ID} (${providerSchema})`);
  console.log('  secret rotated via rotate_identity_provider_app_secret');

  await client.end();
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
