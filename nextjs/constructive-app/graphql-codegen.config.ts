import { loadEnvConfig } from '@next/env';
import type { GraphQLSDKConfigTarget } from '@constructive-io/graphql-codegen';

// Load .env.local for DB_NAME (using Next.js built-in)
loadEnvConfig(process.cwd());

/**
 * Per-DB Template - GraphQL Codegen Configuration
 *
 * Three SDK targets:
 * - admin: Organizations, members, permissions, invites
 * - auth:  Users, emails, authentication
 * - app:   Your business data
 *
 * Usage:
 *   1. Set NEXT_PUBLIC_DB_NAME in .env.local
 *   2. Run: pnpm codegen
 */

const DB_NAME = process.env.NEXT_PUBLIC_DB_NAME;

if (!DB_NAME) {
	throw new Error(
		'NEXT_PUBLIC_DB_NAME is required.\n' +
			'Set it in .env.local:\n' +
			'  NEXT_PUBLIC_DB_NAME=your-db-name',
	);
}

// Codegen connects via IPv6 loopback ([::1]) and uses the Host header to route
// to the correct virtual host. This avoids DNS resolution issues with *.localhost
// subdomains during codegen. Runtime requests use subdomain URLs directly.
const config: Record<string, GraphQLSDKConfigTarget> = {
	admin: {
		reactQuery: true,
		endpoint: process.env.CODEGEN_ADMIN_ENDPOINT ?? 'http://[::1]:3000/graphql',
		headers: { Host: `admin-${DB_NAME}.localhost:3000` },
		output: './src/graphql/sdk/admin',
	},
	auth: {
		reactQuery: true,
		endpoint: process.env.CODEGEN_AUTH_ENDPOINT ?? 'http://[::1]:3000/graphql',
		headers: { Host: `auth-${DB_NAME}.localhost:3000` },
		output: './src/graphql/sdk/auth',
	},
	app: {
		reactQuery: true,
		endpoint: process.env.CODEGEN_APP_ENDPOINT ?? 'http://[::1]:3000/graphql',
		headers: { Host: `app-public-${DB_NAME}.localhost:3000` },
		output: './src/graphql/sdk/app',
	},
};

export default config;
