import { createLogger } from '@/lib/logger';

import { getRuntimeConfig } from './get-runtime-config';

export type SchemaContext = 'schema-builder' | 'dashboard';

export const schemaContexts: readonly SchemaContext[] = ['schema-builder', 'dashboard'];

const logger = createLogger({ scope: 'config-core' });

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
 * For dashboard: Returns null.
 */
export function getDefaultEndpoint(ctx: SchemaContext): string | null {
	let endpoint: string | null = null;

	if (ctx === 'schema-builder') {
		endpoint = getSchemaBuilderEndpoint();
	}
	logger.debug('getDefaultEndpoint called', {
		context: ctx,
		endpoint,
	});

	return endpoint;
}

/**
 * Default endpoints map.
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
