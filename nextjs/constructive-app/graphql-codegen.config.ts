import type { GraphQLSDKConfigTarget } from '@constructive-io/graphql-codegen';

/**
 * Multi-endpoint codegen config for the schema-builder SDK.
 *
 * Each API target generates its own SDK folder under schema-builder-sdk/.
 *
 * - api:  Org CRUD, memberships, permissions, invites, app admin, user profiles, account
 * - auth: Login, register, logout, token refresh, password reset, email verification
 *
 * Auth: JWT obtained via signIn on the auth endpoint works across all public API endpoints.
 */

const config: Record<string, GraphQLSDKConfigTarget> = {
	api: {
		reactQuery: true,
		endpoint: process.env.CODEGEN_API_ENDPOINT ?? 'http://[::1]:3000/graphql',
		headers: { Host: 'api.localhost:3000' },
		output: './src/graphql/schema-builder-sdk/api',
	},
	auth: {
		reactQuery: true,
		endpoint: process.env.CODEGEN_AUTH_ENDPOINT ?? 'http://[::1]:3000/graphql',
		headers: { Host: 'auth.localhost:3000' },
		output: './src/graphql/schema-builder-sdk/auth',
	},
};

export default config;
