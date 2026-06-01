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
// per-DB subdomain pattern: admin-{db}.localhost, auth-{db}.localhost, and the
// app DATA subdomain (api-{db}.localhost by default). The HTTP Host header — not
// the URL — drives server-side API routing, so a URL override alone still 404s;
// the Host must match the routed subdomain.
//
// The {db} segment is the database name with hyphens; PostGraphile maps it back
// to the physical db name by converting hyphens to underscores. Discover the
// exact per-DB domains from services_public.domains if the defaults don't match.
//
// Host overrides (used by both endpoint + Host header so they stay in sync):
// - CODEGEN_ADMIN_HOST  (default: admin-{db}.localhost:3000)
// - CODEGEN_AUTH_HOST   (default: auth-{db}.localhost:3000)
// - CODEGEN_APP_HOST    (default: api-{db}.localhost:3000)  ← app business data
const ADMIN_HOST = process.env.CODEGEN_ADMIN_HOST ?? `admin-${DB_NAME}.localhost:3000`;
const AUTH_HOST = process.env.CODEGEN_AUTH_HOST ?? `auth-${DB_NAME}.localhost:3000`;
const APP_HOST = process.env.CODEGEN_APP_HOST ?? `api-${DB_NAME}.localhost:3000`;

const config: Record<string, GraphQLSDKConfigTarget> = {
	admin: {
		reactQuery: true,
		endpoint: process.env.CODEGEN_ADMIN_ENDPOINT ?? `http://${ADMIN_HOST}/graphql`,
		headers: { Host: ADMIN_HOST },
		output: './src/graphql/sdk/admin',
	},
	auth: {
		reactQuery: true,
		endpoint: process.env.CODEGEN_AUTH_ENDPOINT ?? `http://${AUTH_HOST}/graphql`,
		headers: { Host: AUTH_HOST },
		output: './src/graphql/sdk/auth',
	},
	app: {
		reactQuery: true,
		endpoint: process.env.CODEGEN_APP_ENDPOINT ?? `http://${APP_HOST}/graphql`,
		headers: { Host: APP_HOST },
		output: './src/graphql/sdk/app',
	},
};

export default config;
