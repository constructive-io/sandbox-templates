/** helpers.ts — Shared utilities for provisioning */

import { auth, public_ } from '@constructive-io/node';
import { createFetch } from '@constructive-io/fetch';

import { config } from './config.js';

/** Retry with backoff. Immediately rethrows "already exists" errors. */
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

/** Raw GraphQL execution via @constructive-io/fetch (handles *.localhost DNS). */
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

/** API endpoint client — database, schema, api, apiSchema, domain, etc. */
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

/** Platform-level auth client (auth.localhost). Tokens NOT valid for db-scoped endpoints. */
export function createAuthClient(): ReturnType<typeof auth.createClient> {
  return auth.createClient({ endpoint: config.authEndpoint, headers: {
    'X-Meta-Schema': 'true',
    'X-Schemata': 'constructive_auth_public'
  } });
}

/** Database-scoped auth client (auth-{dbName}.localhost). Tokens valid for app/admin endpoints. */
export function createDbAuthClient(): ReturnType<typeof auth.createClient> {
  return auth.createClient({ endpoint: config.dbAuthEndpoint });
}

/** Raw GraphQL mutation against db-scoped auth endpoint. */
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

/** Require DATABASE_ID from config, exit if missing. */
export function requireDatabaseId(): string {
  const id = config.databaseId;
  if (!id) {
    console.error('Missing DATABASE_ID. Run create-db first.');
    process.exit(1);
  }
  return id;
}
