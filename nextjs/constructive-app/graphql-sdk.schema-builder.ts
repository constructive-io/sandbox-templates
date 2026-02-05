/**
 * Configuration for @constructive-io/graphql-codegen
 * Generates React Query hooks for the Schema Builder endpoint
 *
 * Run: pnpm codegen:sb-sdk
 * Watch: pnpm codegen:sb-sdk:watch
 */
import { defineConfig } from '@constructive-io/graphql-codegen';

const schemaBuilderEndpoint =
	process.env.NEXT_PUBLIC_SCHEMA_BUILDER_GRAPHQL_ENDPOINT ?? 'http://api.localhost:3000/graphql';

export default defineConfig({
	// Schema Builder endpoint
	endpoint: schemaBuilderEndpoint,

	// Output alongside existing codegen output
	output: './src/graphql/schema-builder-sdk',

	// Include all tables
	tables: {
		include: ['*'],
		exclude: ['_*'], // Skip internal/system tables
	},

	// Include all queries except internal ones
	queries: {
		include: ['*'],
		exclude: ['_meta', 'query'], // PostGraphile internal queries
	},

	// Include all mutations
	mutations: {
		include: ['*'],
		exclude: [],
	},

	// Code generation options
	codegen: {
		maxFieldDepth: 5, // Reasonable depth for nested selections
		skipQueryField: true, // Don't include 'query' field in mutation payloads
	},
});
