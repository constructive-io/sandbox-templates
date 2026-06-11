import { createLogger } from '@/lib/logger';

import { getRuntimeConfig } from './get-runtime-config';

/**
 * Per-DB Template - Three API Contexts
 *
 * - admin: Organization, members, permissions, invites (admin-{db}.localhost)
 * - auth:  Users, emails, authentication (auth-{db}.localhost)
 * - app:   Business data - your tables (api-{db}.localhost)
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
		throw new Error('NEXT_PUBLIC_DB_NAME is required. Set it in .env');
	}
	return dbName;
}

// =============================================================================
// Port
// =============================================================================

/**
 * Get the API port (default: 3000).
 */
function getApiPort(): string {
	return getRuntimeConfig('NEXT_PUBLIC_API_PORT') || '3000';
}

// =============================================================================
// Endpoint Getters
// =============================================================================

/**
 * Get the admin endpoint.
 * Used for: organizations, members, permissions, invites
 */
export function getAdminEndpoint(): string {
	const override = getRuntimeConfig('NEXT_PUBLIC_ADMIN_ENDPOINT');
	if (override) return override;

	const dbName = getDbName();
	const port = getApiPort();
	const endpoint = `http://admin-${dbName}.localhost:${port}/graphql`;
	logger.debug('getAdminEndpoint', { dbName, endpoint });
	return endpoint;
}

/**
 * Get the auth endpoint.
 * Used for: users, emails, authentication (signIn, signUp, etc.)
 */
export function getAuthEndpoint(): string {
	const override = getRuntimeConfig('NEXT_PUBLIC_AUTH_ENDPOINT');
	if (override) return override;

	const dbName = getDbName();
	const port = getApiPort();
	const endpoint = `http://auth-${dbName}.localhost:${port}/graphql`;
	logger.debug('getAuthEndpoint', { dbName, endpoint });
	return endpoint;
}

/**
 * Get the app endpoint.
 * Used for: your business data (boards, cards, etc.)
 *
 * The app DATA API is served on the `api-{db}` virtual host (NOT
 * `app-public-{db}`). The browser sends the Host header from this URL's
 * hostname, and that Host header — not the URL — is what drives server-side
 * routing. PostGraphile maps the `{db}` segment back to the physical database
 * by converting hyphens to underscores (so "api" maps to the PostgreSQL
 * schema "app_public").
 *
 * Override with NEXT_PUBLIC_APP_ENDPOINT to point at a different host
 * (e.g. when the per-DB domain in services_public.domains differs).
 */
export function getAppEndpoint(): string {
	const override = getRuntimeConfig('NEXT_PUBLIC_APP_ENDPOINT');
	if (override) return override;

	const dbName = getDbName();
	const port = getApiPort();
	const endpoint = `http://api-${dbName}.localhost:${port}/graphql`;
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

