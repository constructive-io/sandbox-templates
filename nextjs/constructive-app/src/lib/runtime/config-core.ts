import { createLogger } from '@/lib/logger';

import { getRuntimeConfig } from './get-runtime-config';
import type { RuntimeConfigKey } from './runtime-config.types';

export type SchemaContext = 'schema-builder' | 'dashboard';

export const schemaContexts: readonly SchemaContext[] = ['schema-builder', 'dashboard'];

/** Sub-endpoint targets within the schema-builder context */
export type SchemaBuilderSubEndpoint = 'app-public' | 'auth' | 'admin' | 'api';

const logger = createLogger({ scope: 'config-core' });

/**
 * Direct Connect configuration for a specific context.
 * When enabled, allows connecting to a custom GraphQL endpoint with optional auth bypass.
 *
 * This is used for connecting to external/custom GraphQL endpoints.
 * State is session-only and resets on page refresh for safety.
 */
export interface DirectConnectConfig {
	/** Whether Direct Connect is active for this context */
	readonly enabled: boolean;
	/** Custom endpoint URL when enabled. Required when enabled. */
	readonly endpoint: string | null;
	/** Whether to skip authentication (bypass auth headers). Default: true */
	readonly skipAuth: boolean;
}

/** Default Direct Connect state - disabled with no custom endpoint, auth skipped by default */
export const DEFAULT_DIRECT_CONNECT: DirectConnectConfig = {
	enabled: false,
	endpoint: null,
	skipAuth: true,
} as const;

// Hardcoded fallback default for schema-builder (used when no env vars are set)
const DEFAULT_SCHEMA_BUILDER_ENDPOINT = 'http://api.localhost:3000/graphql';

/**
 * Get the schema builder endpoint dynamically.
 * Priority: window.__RUNTIME_CONFIG__ (Docker) > process.env (build-time) > hardcoded default
 */
export function getSchemaBuilderEndpoint(): string {
	const runtimeValue = getRuntimeConfig('NEXT_PUBLIC_SCHEMA_BUILDER_GRAPHQL_ENDPOINT');
	const endpoint = runtimeValue || DEFAULT_SCHEMA_BUILDER_ENDPOINT;

	logger.debug('getSchemaBuilderEndpoint called', {
		runtimeValue,
		fallbackDefault: DEFAULT_SCHEMA_BUILDER_ENDPOINT,
		resolved: endpoint,
		usedFallback: !runtimeValue,
	});

	return endpoint;
}

// --------------------------------------------------------------------------
// Schema-builder sub-endpoint resolution
// --------------------------------------------------------------------------

const SUB_ENDPOINT_ENV_KEYS: Record<SchemaBuilderSubEndpoint, RuntimeConfigKey> = {
	'app-public': 'NEXT_PUBLIC_APP_PUBLIC_GRAPHQL_ENDPOINT',
	auth: 'NEXT_PUBLIC_AUTH_GRAPHQL_ENDPOINT',
	admin: 'NEXT_PUBLIC_ADMIN_GRAPHQL_ENDPOINT',
	api: 'NEXT_PUBLIC_SCHEMA_BUILDER_GRAPHQL_ENDPOINT', // api reuses the legacy key
};

/**
 * Get a schema-builder sub-endpoint dynamically.
 * Priority:
 *   1. Per-sub-endpoint env var (e.g. NEXT_PUBLIC_AUTH_GRAPHQL_ENDPOINT)
 *   2. Main schema-builder endpoint (NEXT_PUBLIC_SCHEMA_BUILDER_GRAPHQL_ENDPOINT)
 *   3. Hardcoded default (api.localhost:3000/graphql)
 */
export function getSchemaBuilderSubEndpoint(sub: SchemaBuilderSubEndpoint): string {
	// 1. Check per-sub-endpoint override
	const subValue = getRuntimeConfig(SUB_ENDPOINT_ENV_KEYS[sub]);
	if (subValue) {
		logger.debug('getSchemaBuilderSubEndpoint called', { sub, resolved: subValue, source: 'sub-endpoint-env' });
		return subValue;
	}

	// 2. Fall back to the main schema-builder endpoint (shared across all sub-endpoints)
	const mainValue = getSchemaBuilderEndpoint();
	logger.debug('getSchemaBuilderSubEndpoint called', { sub, resolved: mainValue, source: 'main-endpoint' });
	return mainValue;
}

// Legacy constant for backwards compatibility (evaluated at module load time)
// WARNING: This is evaluated once at module load. For dynamic resolution, use getSchemaBuilderEndpoint()
// In development, restart the server after changing .env.local for this to update
export const schemaBuilderGraphqlEndpoint = getSchemaBuilderEndpoint();

// Log the initial endpoint resolution for debugging
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
	logger.debug('Module loaded', { schemaBuilderGraphqlEndpoint });
}

/**
 * Get the default endpoint for a given context dynamically.
 *
 * For schema-builder: Returns the configured schema builder endpoint.
 * For dashboard: Returns null - dashboard endpoint must come from database API selection
 *                or Direct Connect configuration.
 */
export function getDefaultEndpoint(ctx: SchemaContext): string | null {
	let endpoint: string | null = null;

	if (ctx === 'schema-builder') {
		endpoint = getSchemaBuilderEndpoint();
	}
	// Dashboard has no default endpoint - it must be selected via database API or Direct Connect

	logger.debug('getDefaultEndpoint called', {
		context: ctx,
		endpoint,
	});

	return endpoint;
}

/**
 * Default endpoints map.
 * Note: Dashboard endpoint is null because it's determined dynamically by database API selection.
 */
export const appEndpoints: Record<SchemaContext, string | null> = {
	'schema-builder': schemaBuilderGraphqlEndpoint,
	dashboard: null,
} as const;

// Routing helpers (no store imports)
let forcedContext: SchemaContext | null = null;

export function setSchemaContext(ctx: SchemaContext | null) {
	forcedContext = ctx;
}

export function detectSchemaContextFromPath(pathname?: string): SchemaContext {
	const p = pathname || (typeof window !== 'undefined' ? window.location.pathname : undefined) || '';

	// Dashboard context: /orgs/[orgId]/databases/[databaseId]/data
	if (p.match(/^\/orgs\/[^/]+\/databases\/[^/]+\/data/)) {
		return 'dashboard';
	}

	// Everything else is schema-builder context
	return 'schema-builder';
}

export function getSchemaContext(): SchemaContext {
	if (forcedContext) return forcedContext;
	return detectSchemaContextFromPath();
}
