import { createLogger } from '@/lib/logger';

import { getRuntimeConfig } from './get-runtime-config';

/**
 * Per-DB Template - Three API Contexts
 *
 * - admin: Organization, members, permissions, invites (admin-{db}.localhost)
 * - auth:  Users, emails, authentication (auth-{db}.localhost)
 * - app:   Business data - your tables (app-public-{db}.localhost)
 */
export type SchemaContext = 'admin' | 'auth' | 'app';

export const schemaContexts: readonly SchemaContext[] = ['admin', 'auth', 'app'];

const logger = createLogger({ scope: 'config-core' });

// =============================================================================
// Database Name (Required)
// =============================================================================

/**
 * Get database name from environment.
 * This is REQUIRED for per-DB mode.
 */
export function getDbName(): string {
	const dbName = getRuntimeConfig('NEXT_PUBLIC_DB_NAME');
	if (!dbName) {
		throw new Error('NEXT_PUBLIC_DB_NAME is required. Set it in .env.local');
	}
	return dbName;
}

// =============================================================================
// Endpoint Getters
// =============================================================================

/**
 * Get the admin endpoint.
 * Used for: organizations, members, permissions, invites
 *
 * Endpoint: http://admin-{db}.localhost:3000/graphql
 */
export function getAdminEndpoint(): string {
	const override = getRuntimeConfig('NEXT_PUBLIC_ADMIN_ENDPOINT');
	if (override) return override;

	const dbName = getDbName();
	const endpoint = `http://admin-${dbName}.localhost:3000/graphql`;
	logger.debug('getAdminEndpoint', { dbName, endpoint });
	return endpoint;
}

/**
 * Get the auth endpoint.
 * Used for: users, emails, authentication (signIn, signUp, etc.)
 *
 * Endpoint: http://auth-{db}.localhost:3000/graphql
 */
export function getAuthEndpoint(): string {
	const override = getRuntimeConfig('NEXT_PUBLIC_AUTH_ENDPOINT');
	if (override) return override;

	const dbName = getDbName();
	const endpoint = `http://auth-${dbName}.localhost:3000/graphql`;
	logger.debug('getAuthEndpoint', { dbName, endpoint });
	return endpoint;
}

/**
 * Get the app endpoint.
 * Used for: your business data (boards, cards, etc.)
 *
 * Endpoint: http://app-public-{db}.localhost:3000/graphql
 */
export function getAppEndpoint(): string {
	const override = getRuntimeConfig('NEXT_PUBLIC_APP_ENDPOINT');
	if (override) return override;

	const dbName = getDbName();
	const endpoint = `http://app-public-${dbName}.localhost:3000/graphql`;
	logger.debug('getAppEndpoint', { dbName, endpoint });
	return endpoint;
}

/**
 * Get endpoint by context.
 */
export function getDefaultEndpoint(ctx?: SchemaContext): string {
	switch (ctx) {
		case 'auth':
			return getAuthEndpoint();
		case 'app':
			return getAppEndpoint();
		case 'admin':
		default:
			return getAdminEndpoint();
	}
}

/**
 * Endpoints map.
 */
export function getEndpoints(): Record<SchemaContext, string> {
	return {
		admin: getAdminEndpoint(),
		auth: getAuthEndpoint(),
		app: getAppEndpoint(),
	};
}

// Legacy compatibility
export const getSchemaBuilderEndpoint = getAdminEndpoint;

export function setSchemaContext(_ctx: SchemaContext | null) {
	// No-op
}

export function getSchemaContext(): SchemaContext {
	return 'admin';
}
