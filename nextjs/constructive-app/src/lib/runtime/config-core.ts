import { createLogger } from '@/lib/logger';

import { getRuntimeConfig } from './get-runtime-config';

export type SchemaContext = 'schema-builder' | 'auth' | 'admin';

export const schemaContexts: readonly SchemaContext[] = ['schema-builder', 'auth', 'admin'];

const logger = createLogger({ scope: 'config-core' });

// Hardcoded fallback defaults (used when no env vars are set)
const DEFAULT_SCHEMA_BUILDER_ENDPOINT = 'http://api.localhost:3000/graphql';
const DEFAULT_AUTH_ENDPOINT = 'http://auth.localhost:3000/graphql';
const DEFAULT_ADMIN_ENDPOINT = 'http://admin.localhost:3000/graphql';

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
 * Get the auth endpoint dynamically.
 * Priority: window.__RUNTIME_CONFIG__ (Docker) > process.env (build-time) > hardcoded default
 */
export function getAuthEndpoint(): string {
	const runtimeValue = getRuntimeConfig('NEXT_PUBLIC_AUTH_GRAPHQL_ENDPOINT');
	const endpoint = runtimeValue || DEFAULT_AUTH_ENDPOINT;

	logger.debug('getAuthEndpoint called', {
		runtimeValue,
		fallbackDefault: DEFAULT_AUTH_ENDPOINT,
		resolved: endpoint,
		usedFallback: !runtimeValue,
	});

	return endpoint;
}

// Legacy constant for backwards compatibility (evaluated at module load time)
export const authGraphqlEndpoint = getAuthEndpoint();

/**
 * Get the admin endpoint dynamically.
 * Priority: window.__RUNTIME_CONFIG__ (Docker) > process.env (build-time) > hardcoded default
 */
export function getAdminEndpoint(): string {
	const runtimeValue = getRuntimeConfig('NEXT_PUBLIC_ADMIN_GRAPHQL_ENDPOINT');
	const endpoint = runtimeValue || DEFAULT_ADMIN_ENDPOINT;

	logger.debug('getAdminEndpoint called', {
		runtimeValue,
		fallbackDefault: DEFAULT_ADMIN_ENDPOINT,
		resolved: endpoint,
		usedFallback: !runtimeValue,
	});

	return endpoint;
}

// Legacy constant for backwards compatibility (evaluated at module load time)
export const adminGraphqlEndpoint = getAdminEndpoint();

/**
 * Get the default endpoint for a given context dynamically.
 */
export function getDefaultEndpoint(ctx?: SchemaContext): string | null {
	let endpoint: string | null;
	switch (ctx) {
		case 'auth':
			endpoint = getAuthEndpoint();
			break;
		case 'admin':
			endpoint = getAdminEndpoint();
			break;
		case 'schema-builder':
		default:
			endpoint = getSchemaBuilderEndpoint();
			break;
	}
	logger.debug('getDefaultEndpoint called', { ctx, endpoint });
	return endpoint;
}

/**
 * Default endpoints map.
 */
export const appEndpoints: Record<SchemaContext, string | null> = {
	'schema-builder': schemaBuilderGraphqlEndpoint,
	'auth': authGraphqlEndpoint,
	'admin': adminGraphqlEndpoint,
} as const;

export function setSchemaContext(_ctx: SchemaContext | null) {
	// No-op: context is determined by usage, not global state
}

export function getSchemaContext(): SchemaContext {
	return 'schema-builder';
}
