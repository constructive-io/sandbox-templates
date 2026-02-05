/**
 * Hook for fetching sites by database
 * @migrated Uses generated SDK from @constructive-io/graphql-codegen
 */

import { useQuery } from '@tanstack/react-query';

import {
	fetchSitesQuery,
	type Site,
} from '@sdk/app-public';

export const siteQueryKeys = {
	all: ['sites'] as const,
	byDatabase: (databaseId: string) => ['sites', databaseId] as const,
	single: (databaseId: string, title: string) => ['sites', databaseId, title] as const,
};

export interface UseSitesOptions {
	enabled?: boolean;
}

export function useSites(databaseId: string, options: UseSitesOptions = {}) {
	return useQuery({
		queryKey: siteQueryKeys.byDatabase(databaseId),
		queryFn: async () => {
			const result = await fetchSitesQuery({ condition: { databaseId } });
			return result.sites?.nodes ?? [];
		},
		enabled: options.enabled !== false && Boolean(databaseId),
	});
}

export type { Site };
