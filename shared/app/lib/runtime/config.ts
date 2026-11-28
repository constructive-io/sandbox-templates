// GraphQL endpoints for the running app.
//
// db-tools and the desktop write NEXT_PUBLIC_AUTH_ENDPOINT,
// NEXT_PUBLIC_APP_ENDPOINT and NEXT_PUBLIC_ADMIN_ENDPOINT into .env.local.
// Without them, the endpoints fall back to the local per-database hosts
// derived from NEXT_PUBLIC_DB_NAME. The admin endpoint carries memberships,
// invitations and profiles.
// `./env` is the framework's reader for those variables.

import { publicEnv, type PublicEnv } from './env';

export type RuntimeConfig = {
	dbName: string | null;
	authEndpoint: string;
	appEndpoint: string;
	adminEndpoint: string;
	storageEndpoint: string;
};

function siblingStorageEndpoint(appEndpoint: string): string {
	try {
		const endpoint = new URL(appEndpoint);
		if (!endpoint.hostname.startsWith('api-')) return '';
		endpoint.hostname = endpoint.hostname.replace(/^api-/, 'storage-');
		return endpoint.href;
	} catch {
		return '';
	}
}

function localEndpoint(plane: 'auth' | 'api' | 'admin', env: PublicEnv): string {
	if (!env.dbName) return '';
	// Hosts carry the database name with hyphens; the server maps them back to underscores.
	const host = `${plane}-${env.dbName.replace(/_/g, '-')}.localhost`;
	return `http://${host}${env.apiPort ? `:${env.apiPort}` : ''}/graphql`;
}

export function resolveRuntimeConfig(env: PublicEnv): RuntimeConfig {
	const appEndpoint = env.appEndpoint || localEndpoint('api', env);
	return {
		dbName: env.dbName || null,
		authEndpoint: env.authEndpoint || localEndpoint('auth', env),
		appEndpoint,
		adminEndpoint: env.adminEndpoint || localEndpoint('admin', env),
		storageEndpoint: env.storageEndpoint || siblingStorageEndpoint(appEndpoint),
	};
}

export const runtimeConfig = resolveRuntimeConfig(publicEnv);
