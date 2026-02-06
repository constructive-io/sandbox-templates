/**
 * Tests for cross-context cache invalidation (schema-builder → dashboard).
 *
 * When a user modifies schema in schema-builder (add field, create table, etc.)
 * then navigates to dashboard, the dashboard must show fresh schema metadata.
 *
 * The invalidation bridge uses a two-phase strategy:
 * 1. `removeQueries` for schema queries (meta + relations) — no stale data served
 * 2. `invalidateQueries` for data queries (rows, counts) — stale-while-revalidate is fine
 */
import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it, beforeEach } from 'vitest';

import { isDashboardCacheScopeKey, dashboardQueryKeys } from '../dashboard-query-keys';
import type { DashboardCacheScopeKey } from '../use-dashboard-cache-scope';

// Mirror the matchesDashboard predicate from invalidateDashboardQueries
function matchesDashboard(databaseId: string | null, queryKey: readonly unknown[]): boolean {
	const [root, scope] = queryKey as unknown[];
	if (root !== 'dashboard') return false;
	if (!databaseId) return true;
	return isDashboardCacheScopeKey(scope) && scope.databaseId === databaseId;
}

// Mirror the schema query type check from invalidateDashboardQueries
function isSchemaQuery(queryKey: readonly unknown[]): boolean {
	const type = queryKey[2];
	return type === 'meta' || type === 'relations';
}

describe('cross-context invalidation', () => {
	const scope: DashboardCacheScopeKey = {
		databaseId: 'db-123',
		endpoint: 'http://dbe.localhost:3000/graphql',
	};

	const otherScope: DashboardCacheScopeKey = {
		databaseId: 'db-other',
		endpoint: 'http://dbe.localhost:3000/graphql',
	};

	describe('matchesDashboard predicate', () => {
		it('matches meta query for the target database', () => {
			const metaKey = dashboardQueryKeys.meta(scope);
			expect(matchesDashboard('db-123', metaKey)).toBe(true);
		});

		it('matches table query for the target database', () => {
			const tableKey = dashboardQueryKeys.table(scope, 'users');
			expect(matchesDashboard('db-123', tableKey)).toBe(true);
		});

		it('matches relations query for the target database', () => {
			const relKey = dashboardQueryKeys.relations(scope, 'posts');
			expect(matchesDashboard('db-123', relKey)).toBe(true);
		});

		it('does not match queries for a different database', () => {
			const metaKey = dashboardQueryKeys.meta(otherScope);
			expect(matchesDashboard('db-123', metaKey)).toBe(false);
		});

		it('does not match non-dashboard queries', () => {
			const nonDashboardKey = ['schema-builder', 'tables'] as const;
			expect(matchesDashboard('db-123', nonDashboardKey)).toBe(false);
		});

		it('matches all dashboard queries when databaseId is null', () => {
			const metaKey = dashboardQueryKeys.meta(scope);
			const otherMetaKey = dashboardQueryKeys.meta(otherScope);
			expect(matchesDashboard(null, metaKey)).toBe(true);
			expect(matchesDashboard(null, otherMetaKey)).toBe(true);
		});
	});

	describe('schema query type detection', () => {
		it('identifies meta as a schema query', () => {
			const metaKey = dashboardQueryKeys.meta(scope);
			expect(isSchemaQuery(metaKey)).toBe(true);
		});

		it('identifies relations as a schema query', () => {
			const relKey = dashboardQueryKeys.relations(scope, 'posts');
			expect(isSchemaQuery(relKey)).toBe(true);
		});

		it('does not identify table data as a schema query', () => {
			const tableKey = dashboardQueryKeys.table(scope, 'users');
			expect(isSchemaQuery(tableKey)).toBe(false);
		});

		it('does not identify infinite-table as a schema query', () => {
			const infiniteKey = dashboardQueryKeys.infiniteTable(scope, 'users');
			expect(isSchemaQuery(infiniteKey)).toBe(false);
		});

		it('does not identify tableRows as a schema query', () => {
			const rowsKey = dashboardQueryKeys.tableRows(scope, 'users', {});
			expect(isSchemaQuery(rowsKey)).toBe(false);
		});

		it('does not identify tableCount as a schema query', () => {
			const countKey = dashboardQueryKeys.tableCount(scope, 'users');
			expect(isSchemaQuery(countKey)).toBe(false);
		});
	});

	describe('dashboard query key structure', () => {
		it('meta key starts with ["dashboard", scope]', () => {
			const metaKey = dashboardQueryKeys.meta(scope);
			expect(metaKey[0]).toBe('dashboard');
			expect(metaKey[1]).toEqual(scope);
			expect(metaKey[2]).toBe('meta');
		});

		it('scope key contains databaseId and endpoint', () => {
			const scopeKey = dashboardQueryKeys.scope(scope);
			expect(scopeKey[0]).toBe('dashboard');
			expect(scopeKey[1]).toHaveProperty('databaseId', 'db-123');
			expect(scopeKey[1]).toHaveProperty('endpoint');
		});
	});

	describe('isDashboardCacheScopeKey guard', () => {
		it('returns true for valid scope key', () => {
			expect(isDashboardCacheScopeKey(scope)).toBe(true);
		});

		it('returns false for null/undefined', () => {
			expect(isDashboardCacheScopeKey(null)).toBe(false);
			expect(isDashboardCacheScopeKey(undefined)).toBe(false);
		});

		it('returns false for non-object', () => {
			expect(isDashboardCacheScopeKey('dashboard')).toBe(false);
		});

		it('returns false for object missing databaseId', () => {
			expect(isDashboardCacheScopeKey({ endpoint: 'http://localhost' })).toBe(false);
		});
	});

	describe('removeQueries vs invalidateQueries integration', () => {
		let queryClient: QueryClient;

		beforeEach(() => {
			queryClient = new QueryClient({
				defaultOptions: { queries: { retry: false } },
			});
		});

		it('removeQueries deletes schema cache entries entirely', () => {
			// Seed cache with meta and relations data
			queryClient.setQueryData(dashboardQueryKeys.meta(scope), { _meta: { tables: [] } });
			queryClient.setQueryData(dashboardQueryKeys.relations(scope, 'posts'), { relations: {} });

			// Remove schema queries (mirrors invalidateDashboardQueries logic)
			queryClient.removeQueries({
				predicate: (query) => {
					if (!matchesDashboard('db-123', query.queryKey)) return false;
					return isSchemaQuery(query.queryKey);
				},
			});

			// Schema cache should be gone
			expect(queryClient.getQueryData(dashboardQueryKeys.meta(scope))).toBeUndefined();
			expect(queryClient.getQueryData(dashboardQueryKeys.relations(scope, 'posts'))).toBeUndefined();
		});

		it('removeQueries does not affect data queries', () => {
			const rowData = { users: [{ id: 1 }] };
			queryClient.setQueryData(dashboardQueryKeys.meta(scope), { _meta: { tables: [] } });
			queryClient.setQueryData(dashboardQueryKeys.table(scope, 'users'), rowData);

			// Remove only schema queries
			queryClient.removeQueries({
				predicate: (query) => {
					if (!matchesDashboard('db-123', query.queryKey)) return false;
					return isSchemaQuery(query.queryKey);
				},
			});

			// Meta removed, but table data still present
			expect(queryClient.getQueryData(dashboardQueryKeys.meta(scope))).toBeUndefined();
			expect(queryClient.getQueryData(dashboardQueryKeys.table(scope, 'users'))).toEqual(rowData);
		});

		it('removeQueries scoped to databaseId does not affect other databases', () => {
			queryClient.setQueryData(dashboardQueryKeys.meta(scope), { _meta: { tables: [] } });
			queryClient.setQueryData(dashboardQueryKeys.meta(otherScope), { _meta: { tables: ['other'] } });

			// Remove only for db-123
			queryClient.removeQueries({
				predicate: (query) => {
					if (!matchesDashboard('db-123', query.queryKey)) return false;
					return isSchemaQuery(query.queryKey);
				},
			});

			expect(queryClient.getQueryData(dashboardQueryKeys.meta(scope))).toBeUndefined();
			expect(queryClient.getQueryData(dashboardQueryKeys.meta(otherScope))).toEqual({ _meta: { tables: ['other'] } });
		});
	});
});
