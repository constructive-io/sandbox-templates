import type { GraphQLSDKConfigTarget } from '@constructive-io/graphql-codegen';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Load .env for DB_NAME and other config
// Next.js 16+ no longer ships @next/env as a separate module.
// We read .env manually to populate process.env before codegen runs.
try {
	const envPath = resolve(process.cwd(), '.env');
	if (existsSync(envPath)) {
		const content = readFileSync(envPath, 'utf8');
		for (const line of content.split('\n')) {
			const match = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*"?([^"\n]*)"?\s*$/);
			if (match && !process.env[match[1]]) {
				process.env[match[1]] = match[2];
			}
		}
	}
} catch {
	// .env not found or not readable — use existing env vars
}

/**
 * Per-DB Template - GraphQL Codegen Configuration
 *
 * Three SDK targets:
 * - admin: Organizations, members, permissions, invites
 * - auth:  Users, emails, authentication
 * - app:   Your business data
 *
 * Usage:
 *   1. Set NEXT_PUBLIC_DB_NAME in .env
 *   2. Run: pnpm codegen
 */

const DB_NAME = process.env.NEXT_PUBLIC_DB_NAME;

if (!DB_NAME) {
	throw new Error(
		'NEXT_PUBLIC_DB_NAME is required.\n' +
			'Set it in .env:\n' +
			'  NEXT_PUBLIC_DB_NAME=your-db-name',
	);
}

// Codegen connects via subdomain-based virtual hosts. Endpoints use the
// per-DB subdomain pattern: admin-{db}.localhost, auth-{db}.localhost,
// app-{db}.localhost. The Host header controls server-side API routing.
const config: Record<string, GraphQLSDKConfigTarget> = {
	admin: {
		reactQuery: true,
		endpoint: process.env.CODEGEN_ADMIN_ENDPOINT ?? `http://admin-${DB_NAME}.localhost:3000/graphql`,
		headers: { Host: `admin-${DB_NAME}.localhost:3000` },
		output: './src/graphql/sdk/admin',
	},
	auth: {
		reactQuery: true,
		endpoint: process.env.CODEGEN_AUTH_ENDPOINT ?? `http://auth-${DB_NAME}.localhost:3000/graphql`,
		headers: { Host: `auth-${DB_NAME}.localhost:3000` },
		output: './src/graphql/sdk/auth',
	},
	app: {
		reactQuery: true,
		endpoint: process.env.CODEGEN_APP_ENDPOINT ?? `http://api-${DB_NAME}.localhost:3000/graphql`,
		headers: { Host: `api-${DB_NAME}.localhost:3000` },
		output: './src/graphql/sdk/app',
	},
};

export default config;
