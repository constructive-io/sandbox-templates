import type { DashboardCacheScopeKey } from './use-dashboard-cache-scope';

export function isDashboardCacheScopeKey(value: unknown): value is DashboardCacheScopeKey {
	if (!value || typeof value !== 'object') return false;
	const candidate = value as Record<string, unknown>;
	return 'databaseId' in candidate && 'endpoint' in candidate;
}

export const dashboardQueryKeys = {
	root: ['dashboard'] as const,
	scope: (scope: DashboardCacheScopeKey) => ['dashboard', scope] as const,
	meta: (scope: DashboardCacheScopeKey) => [...dashboardQueryKeys.scope(scope), 'meta'] as const,
	relations: (scope: DashboardCacheScopeKey, tableName: string) =>
		[...dashboardQueryKeys.scope(scope), 'relations', tableName] as const,

	table: (scope: DashboardCacheScopeKey, tableName: string) => [...dashboardQueryKeys.scope(scope), 'table', tableName] as const,
	tableRows: (scope: DashboardCacheScopeKey, tableName: string, options?: unknown) =>
		[...dashboardQueryKeys.table(scope, tableName), 'rows', options] as const,
	tableRow: (scope: DashboardCacheScopeKey, tableName: string, id: unknown) =>
		[...dashboardQueryKeys.table(scope, tableName), 'row', id] as const,
	tableCount: (scope: DashboardCacheScopeKey, tableName: string, where?: Record<string, unknown> | null) =>
		[...dashboardQueryKeys.table(scope, tableName), 'count', where] as const,

	infiniteTable: (scope: DashboardCacheScopeKey, tableName: string) =>
		[...dashboardQueryKeys.scope(scope), 'infinite-table', tableName] as const,
	infiniteTablePage: (scope: DashboardCacheScopeKey, tableName: string, pageIndex: number, options: unknown) =>
		[...dashboardQueryKeys.infiniteTable(scope, tableName), 'page', pageIndex, options] as const,
	infiniteTableTotalCount: (scope: DashboardCacheScopeKey, tableName: string, where?: Record<string, unknown>) =>
		[...dashboardQueryKeys.infiniteTable(scope, tableName), 'totalCount', where] as const,
} as const;
