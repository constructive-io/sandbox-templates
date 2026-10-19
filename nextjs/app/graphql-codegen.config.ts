import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import type { GraphQLSDKConfigTarget } from '@constructive-io/graphql-codegen';

// Typed SDKs for the two planes the app talks to:
//   auth  users, emails, sign-in        → src/graphql/sdk/auth
//   app   the database's own tables     → src/graphql/sdk/app
//
// Endpoints, first match wins:
//   CODEGEN_{AUTH,APP}_ENDPOINT  (set by db-tools)
//   NEXT_PUBLIC_{AUTH,APP}_ENDPOINT from the environment or .env.local
//   http://{auth,api}-<NEXT_PUBLIC_DB_NAME>.localhost/graphql
// CODEGEN_{AUTH,APP}_HOST overrides the Host header, which routes the request
// on the server; it defaults to the endpoint's own host.
// CODEGEN_{AUTH,APP}_SCHEMA_FILE generates from a saved SDL file instead, with
// no server (CI uses this).

for (const file of ['.env.local', '.env']) {
	const path = resolve(process.cwd(), file);
	if (!existsSync(path)) continue;
	for (const line of readFileSync(path, 'utf8').split('\n')) {
		const match = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*"?([^"\n]*)"?\s*$/);
		if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2];
	}
}

function target(plane: 'AUTH' | 'APP', subdomain: string, output: string): GraphQLSDKConfigTarget {
	const schemaFile = process.env[`CODEGEN_${plane}_SCHEMA_FILE`];
	if (schemaFile) return { schemaFile, output, orm: true, reactQuery: true };
	const dbName = process.env.NEXT_PUBLIC_DB_NAME?.replace(/_/g, '-');
	const endpoint =
		process.env[`CODEGEN_${plane}_ENDPOINT`] ||
		process.env[`NEXT_PUBLIC_${plane}_ENDPOINT`] ||
		(dbName ? `http://${subdomain}-${dbName}.localhost/graphql` : undefined);
	if (!endpoint) {
		throw new Error(
			`No ${plane.toLowerCase()} endpoint: set NEXT_PUBLIC_DB_NAME or NEXT_PUBLIC_${plane}_ENDPOINT in .env.local.`,
		);
	}
	const host = process.env[`CODEGEN_${plane}_HOST`] || new URL(endpoint).host;
	return { endpoint, headers: { Host: host }, output, orm: true, reactQuery: true };
}

const config: Record<string, GraphQLSDKConfigTarget> = {
	auth: target('AUTH', 'auth', './src/graphql/sdk/auth'),
	app: target('APP', 'api', './src/graphql/sdk/app'),
};

export default config;
