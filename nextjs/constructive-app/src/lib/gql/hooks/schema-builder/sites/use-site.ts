/**
 * Hook for fetching a single site
 * @migrated Uses generated SDK from @constructive-io/graphql-codegen
 */

import { useQuery } from '@tanstack/react-query';

import { fetchSitesQuery } from '@sdk/app-public';

import { siteQueryKeys } from './use-sites';

export interface UseSiteOptions {
	enabled?: boolean;
}

export function useSite(databaseId: string, title: string, options: UseSiteOptions = {}) {
	return useQuery({
		queryKey: siteQueryKeys.single(databaseId, title),
		queryFn: async () => {
			const result = await fetchSitesQuery({
				condition: { databaseId, title },
				first: 1,
			});
			return result.sites?.nodes?.[0] ?? null;
		},
		enabled: options.enabled !== false && Boolean(databaseId && title),
	});
}
