/**
 * Hook for fetching site modules
 * @migrated Uses generated SDK from @constructive-io/graphql-codegen
 */

import { useQuery } from '@tanstack/react-query';

import { fetchSiteModulesQuery } from '@sdk/app-public';

export const siteModuleQueryKeys = {
	all: ['site-modules'] as const,
	bySite: (siteId: string) => ['site-modules', siteId] as const,
	single: (siteId: string, name: string) => ['site-modules', siteId, name] as const,
};

export interface UseSiteModuleOptions {
	enabled?: boolean;
}

export function useSiteModule(
	databaseId: string,
	siteId: string,
	name: string,
	options: UseSiteModuleOptions = {}
) {
	return useQuery({
		queryKey: siteModuleQueryKeys.single(siteId, name),
		queryFn: async () => {
			const result = await fetchSiteModulesQuery({
				condition: { databaseId, siteId, name },
				first: 1,
			});
			return result.siteModules?.nodes?.[0] ?? null;
		},
		enabled: options.enabled !== false && Boolean(databaseId && siteId && name),
	});
}

export function useSiteModules(siteId: string, options: UseSiteModuleOptions = {}) {
	return useQuery({
		queryKey: siteModuleQueryKeys.bySite(siteId),
		queryFn: async () => {
			const result = await fetchSiteModulesQuery({ condition: { siteId } });
			return result.siteModules?.nodes ?? [];
		},
		enabled: options.enabled !== false && Boolean(siteId),
	});
}
