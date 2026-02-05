/**
 * Hooks for fetching apps
 * @migrated Uses generated SDK from @constructive-io/graphql-codegen
 */

import { useQuery } from '@tanstack/react-query';

import { fetchAppsQuery } from '@sdk/app-public';

export const appQueryKeys = {
	all: ['apps'] as const,
	bySite: (siteId: string) => ['apps', siteId] as const,
	single: (siteId: string, name: string) => ['apps', siteId, name] as const,
};

export interface UseAppOptions {
	enabled?: boolean;
}

export function useApp(
	databaseId: string,
	siteId: string,
	name: string,
	options: UseAppOptions = {}
) {
	return useQuery({
		queryKey: appQueryKeys.single(siteId, name),
		queryFn: async () => {
			const result = await fetchAppsQuery({
				condition: { databaseId, siteId, name },
				first: 1,
			});
			return result.apps?.nodes?.[0] ?? null;
		},
		enabled: options.enabled !== false && Boolean(databaseId && siteId && name),
	});
}

export function useApps(siteId: string, options: UseAppOptions = {}) {
	return useQuery({
		queryKey: appQueryKeys.bySite(siteId),
		queryFn: async () => {
			const result = await fetchAppsQuery({ condition: { siteId } });
			return result.apps?.nodes ?? [];
		},
		enabled: options.enabled !== false && Boolean(siteId),
	});
}
