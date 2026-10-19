// Placeholder until `pnpm codegen` generates the app SDK into this directory.
// It has the client surface the shell uses and no models, so the app type-checks
// and builds before the database has tables.

import type { GraphQLAdapter } from '@constructive-io/graphql-query/runtime';

export type { GraphQLAdapter, GraphQLError, QueryResult } from '@constructive-io/graphql-query/runtime';

export interface OrmClientConfig {
	endpoint?: string;
	headers?: Record<string, string>;
	fetch?: typeof globalThis.fetch;
	adapter?: GraphQLAdapter;
}

export function createClient(_config: OrmClientConfig) {
	return {};
}

export function configure(_config: OrmClientConfig): void {}
