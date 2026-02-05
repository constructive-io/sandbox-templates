import type { QueryClient, QueryKey } from '@tanstack/react-query';

import { useAppStore } from '@/store/app-store';
// Dashboard query keys removed - dashboard functionality has been removed from the application

import { domainKeys } from '@sdk/app-public';
import { apiSchemaQueryKeys } from '../apis/use-api-schemas';
import { apiQueryKeys } from '../apis/use-apis';
import { databaseServicesQueryKeys } from '../apis/use-database-services';
import { appQueryKeys } from '../sites/use-apps';
import { databaseAppsQueryKeys } from '../sites/use-database-apps';
import { siteModuleQueryKeys } from '../sites/use-site-modules';
import { siteThemeQueryKeys } from '../sites/use-site-themes';
import { siteQueryKeys } from '../sites/use-sites';
import { accessibleDatabasesQueryKeys } from '../use-accessible-databases';
import { databaseConstraintsQueryKeys } from '../use-database-constraints';
import { databaseTablesQueryKeys } from '../use-database-tables';
import { userDatabasesQueryKeys } from '../use-user-databases';

const invalidateQueryKey = (queryClient: QueryClient, queryKey: QueryKey) =>
	queryClient.invalidateQueries({ queryKey });

// Dashboard query invalidation removed - dashboard functionality has been removed from the application
// function invalidateDashboardQueries(queryClient: QueryClient, databaseId?: string | null) {
// 	const matchesDashboard = (queryKey: readonly unknown[]): boolean => {
// 		const [root, scope] = queryKey as unknown[];
// 		if (root !== 'dashboard') return false;
// 		if (!databaseId) return true;
// 		return isDashboardCacheScopeKey(scope) && scope.databaseId === databaseId;
// 	};
// 	queryClient.removeQueries({
// 		predicate: (query) => {
// 			if (!matchesDashboard(query.queryKey)) return false;
// 			const type = query.queryKey[2];
// 			return type === 'meta' || type === 'relations';
// 		},
// 	});
// 	return queryClient.invalidateQueries({
// 		predicate: (query) => matchesDashboard(query.queryKey),
// 	});
// }

export async function invalidateDatabaseEntities(queryClient: QueryClient, databaseId?: string | null) {
	const tasks: Array<Promise<unknown>> = [];

	// Draft rows clearing removed - dashboard functionality has been removed
	// if (databaseId) {
	// 	try {
	// 		useAppStore.getState().clearDraftRowsForDatabase(databaseId);
	// 	} catch {}
	// }

	if (databaseId) {
		tasks.push(invalidateQueryKey(queryClient, databaseTablesQueryKeys.byDatabase(databaseId)));
		tasks.push(invalidateQueryKey(queryClient, databaseServicesQueryKeys.byDatabase(databaseId)));
		tasks.push(invalidateQueryKey(queryClient, databaseAppsQueryKeys.byDatabase(databaseId)));
		tasks.push(invalidateQueryKey(queryClient, domainKeys.list({ condition: { databaseId } })));
		tasks.push(invalidateQueryKey(queryClient, siteQueryKeys.byDatabase(databaseId)));
		tasks.push(invalidateQueryKey(queryClient, apiQueryKeys.byDatabase(databaseId)));
		// These queries use the table id or other params; the prefix ensures all cached tables refresh.
		tasks.push(invalidateQueryKey(queryClient, ['database-table']));
	}

	// Dashboard query invalidation removed - dashboard functionality has been removed
	// tasks.push(invalidateDashboardQueries(queryClient, databaseId));

	// Global database context
	// CRITICAL: Must invalidate BOTH split query keys since useSchemaBuilderSelectors uses them
	tasks.push(invalidateQueryKey(queryClient, userDatabasesQueryKeys.all));
	tasks.push(invalidateQueryKey(queryClient, accessibleDatabasesQueryKeys.all));
	tasks.push(invalidateQueryKey(queryClient, databaseConstraintsQueryKeys.all));

	// Entities without direct database keyed helpers
	tasks.push(invalidateQueryKey(queryClient, databaseTablesQueryKeys.all));
	tasks.push(invalidateQueryKey(queryClient, databaseServicesQueryKeys.all));
	tasks.push(invalidateQueryKey(queryClient, databaseAppsQueryKeys.all));
	tasks.push(invalidateQueryKey(queryClient, domainKeys.all));
	tasks.push(invalidateQueryKey(queryClient, siteQueryKeys.all));
	tasks.push(invalidateQueryKey(queryClient, apiQueryKeys.all));
	tasks.push(invalidateQueryKey(queryClient, siteModuleQueryKeys.all));
	tasks.push(invalidateQueryKey(queryClient, siteThemeQueryKeys.all));
	tasks.push(invalidateQueryKey(queryClient, appQueryKeys.all));
	tasks.push(invalidateQueryKey(queryClient, apiSchemaQueryKeys.all));

	await Promise.allSettled(tasks);
}
