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
 * Create a metaschema client using the upstream Constructive SDK.
 * The metaschema client has models for blueprint, database,
 * constructBlueprint etc.
 */
export function createMetaschemaClient(): ReturnType<typeof public_.createClient> {
  const token = config.accessToken;
  if (!token) throw new Error('ACCESS_TOKEN is required');

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'X-Meta-Schema': 'true'
  };
  if (config.databaseId) {
    headers['X-Database-Id'] = config.databaseId;
  }
  return public_.createClient({ endpoint: config.apiEndpoint, headers });
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
