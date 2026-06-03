/**
 * helpers.ts — Shared utilities for constructive-app provisioning
 *
 * Uses @constructive-io/node for auth/public_ SDK clients and @constructive-io/fetch for HTTP.
 */

import { auth, public_ } from '@constructive-io/node';
import { createFetch } from '@constructive-io/fetch';

import { config } from './config.js';

/**
 * Retry helper for transient failures during provisioning.
 * Immediately rethrows "already exists" errors (idempotency).
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 5,
  delayMs = 2000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('already exists') || msg.includes('ACCOUNT_EXISTS') || msg.includes('duplicate key') || msg.includes('unique constraint')) throw err;
      if (attempt === maxRetries) throw err;
      console.log(
        `   Attempt ${attempt}/${maxRetries} failed: ${msg.slice(0, 120)}. Retrying in ${delayMs}ms...`
      );
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw new Error('unreachable');
}

/**
 * Execute a raw GraphQL query/mutation against a given endpoint.
 * Uses @constructive-io/fetch for *.localhost DNS handling.
 */
export async function rawExecute<T = unknown>(
  endpoint: string,
  headers: Record<string, string>,
  query: string,
  variables: Record<string, unknown> = {}
): Promise<{ ok: boolean; data: T | null; errors?: Array<{ message: string }> }> {
  const fetchFn = createFetch();
  const response = await fetchFn(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    return {
      ok: false,
      data: null,
      errors: [{ message: `HTTP ${response.status}: ${response.statusText}` }],
    };
  }

  const json = (await response.json()) as {
    data?: T;
    errors?: Array<{ message: string }>;
  };

  if (json.errors && json.errors.length > 0) {
    return { ok: false, data: null, errors: json.errors };
  }

  return { ok: true, data: json.data as T };
}

/**
 * Build the standard metaschema auth headers (bearer + X-Meta-Schema, plus
 * X-Database-Id when known). Shared by the api-host and modules-host clients.
 */
function metaschemaHeaders(): Record<string, string> {
  const token = config.accessToken;
  if (!token) throw new Error('ACCESS_TOKEN is required');

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'X-Meta-Schema': 'true',
  };
  if (config.databaseId) {
    headers['X-Database-Id'] = config.databaseId;
  }
  return headers;
}

/**
 * Create a metaschema READ client (api.localhost). Use this for metaschema
 * READS — api/schema/table/database findMany — and for createApiSchema /
 * createDatabase. The provisioning MUTATIONS (blueprint / constructBlueprint /
 * databaseProvisionModule / secureTableProvision) are NOT on this host; use
 * {@link createModulesClient} for those.
 */
export function createMetaschemaClient(): ReturnType<typeof public_.createClient> {
  return public_.createClient({ endpoint: config.apiEndpoint, headers: metaschemaHeaders() });
}

/**
 * Create a provisioning MUTATION client (modules.localhost). The
 * metaschema_modules API hosts createDatabaseProvisionModule, createBlueprint,
 * constructBlueprint and createSecureTableProvision — their input types are ONLY
 * registered here, so routing them through {@link createMetaschemaClient}
 * (api.localhost) fails with 'Unknown type ...Input'.
 */
export function createModulesClient(): ReturnType<typeof public_.createClient> {
  return public_.createClient({ endpoint: config.modulesEndpoint, headers: metaschemaHeaders() });
}

/**
 * Create an auth client for sign-up / sign-in via the GLOBAL
 * metaschema auth endpoint (auth.localhost). Tokens from this
 * endpoint are NOT valid for database-scoped endpoints.
 * Only used by create-db.ts for the initial admin user.
 */
export function createAuthClient(): ReturnType<typeof auth.createClient> {
  return auth.createClient({ endpoint: config.authEndpoint, headers: {
    'X-Meta-Schema': 'true',
    'X-Schemata': 'constructive_auth_public'
  } });
}

/**
 * Create an auth client for sign-up / sign-in via the DATABASE-SCOPED
 * auth endpoint (auth-{dbName}.localhost). Tokens from this endpoint
 * ARE valid for the app and admin endpoints of the same database.
 */
export function createDbAuthClient(): ReturnType<typeof auth.createClient> {
  return auth.createClient({ endpoint: config.dbAuthEndpoint });
}

/**
 * Execute a raw GraphQL mutation against the auth endpoint.
 */
export async function executeAuthMutation<T = unknown>(
  accessToken: string,
  mutation: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  const result = await rawExecute<T>(config.dbAuthEndpoint, {
    Authorization: `Bearer ${accessToken}`,
  }, mutation, variables);
  if (!result.ok) {
    const msgs = result.errors?.map((e: { message: string }) => e.message).join('; ') ?? 'Unknown error';
    throw new Error(`Auth mutation failed: ${msgs}`);
  }
  return result.data as T;
}

/**
 * Resolve the PHYSICAL postgres schema name for a tenant from its LOGICAL
 * metaschema name (e.g. 'memberships_public' → 'myapp_memberships_public' or
 * 'myapp-<hash>-memberships-public', depending on the server naming mode).
 *
 * This anchors raw SQL to THIS tenant's schema via the metaschema (scoped by
 * database_id) instead of a floating `LIKE '%memberships_public'`, which on a
 * shared hub can land on a SIBLING tenant's schema — a data-corruption risk.
 *
 * Returns undefined if the database has no schema with that logical name.
 * `endpoint`/`token` default to the metaschema READ host (api.localhost) and the
 * configured access token, but are overridable for create-db (which holds a
 * freshly-issued token before .env is written).
 */
export async function resolvePhysicalSchemaName(
  databaseId: string,
  logicalName: string,
  opts: { endpoint?: string; token?: string } = {}
): Promise<string | undefined> {
  const token = opts.token ?? config.accessToken;
  if (!token) throw new Error('ACCESS_TOKEN is required to resolve schema names');
  const client = public_.createClient({
    endpoint: opts.endpoint ?? config.apiEndpoint,
    headers: { Authorization: `Bearer ${token}`, 'X-Meta-Schema': 'true', 'X-Database-Id': databaseId },
  });
  const result = await client.schema
    .findMany({
      where: { databaseId: { equalTo: databaseId }, name: { equalTo: logicalName } },
      select: { id: true, name: true, schemaName: true },
    })
    .unwrap();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (result as any)?.schemas?.nodes?.[0]?.schemaName;
}

/**
 * Get the database ID from config, throwing if missing.
 */
export function requireDatabaseId(): string {
  const id = config.databaseId;
  if (!id) {
    console.error('Missing DATABASE_ID. Run create-db first.');
    process.exit(1);
  }
  return id;
}
