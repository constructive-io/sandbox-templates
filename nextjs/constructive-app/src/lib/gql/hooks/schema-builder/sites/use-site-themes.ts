/**
 * Hook for fetching site themes
 * @migrated Uses generated SDK from @constructive-io/graphql-codegen
 */

import { useQuery } from '@tanstack/react-query';

import { fetchSiteThemesQuery } from '@sdk/app-public';

export const siteThemeQueryKeys = {
	all: ['site-themes'] as const,
	bySite: (siteId: string) => ['site-themes', siteId] as const,
};

export interface UseSiteThemeOptions {
	enabled?: boolean;
}

export function useSiteTheme(databaseId: string, siteId: string, options: UseSiteThemeOptions = {}) {
	return useQuery({
		queryKey: siteThemeQueryKeys.bySite(siteId),
		queryFn: async () => {
			const result = await fetchSiteThemesQuery({
				condition: { databaseId, siteId },
				first: 1,
			});
			return result.siteThemes?.nodes?.[0] ?? null;
		},
		enabled: options.enabled !== false && Boolean(databaseId && siteId),
	});
}
