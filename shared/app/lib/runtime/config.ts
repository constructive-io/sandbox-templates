// GraphQL endpoints for the running app.
//
// db-tools and the desktop write NEXT_PUBLIC_AUTH_ENDPOINT and
// NEXT_PUBLIC_APP_ENDPOINT into .env.local. Without them, the endpoints fall
// back to the local per-database hosts derived from NEXT_PUBLIC_DB_NAME.
// `./env` is the framework's reader for those variables.

import { publicEnv, type PublicEnv } from './env';

export type RuntimeConfig = {
	dbName: string | null;
	authEndpoint: string;
	appEndpoint: string;
};

function localEndpoint(plane: 'auth' | 'api', env: PublicEnv): string {
	if (!env.dbName) return '';
	// Hosts carry the database name with hyphens; the server maps them back to underscores.
	const host = `${plane}-${env.dbName.replace(/_/g, '-')}.localhost`;
	return `http://${host}${env.apiPort ? `:${env.apiPort}` : ''}/graphql`;
}

export function resolveRuntimeConfig(env: PublicEnv): RuntimeConfig {
	return {
		dbName: env.dbName || null,
		authEndpoint: env.authEndpoint || localEndpoint('auth', env),
		appEndpoint: env.appEndpoint || localEndpoint('api', env),
	};
}

export const runtimeConfig = resolveRuntimeConfig(publicEnv);
