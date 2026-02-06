/**
 * Hook for fetching APIs by database
 * @migrated Uses generated SDK from @constructive-io/graphql-codegen
 */

import { useQuery } from '@tanstack/react-query';

import {
	fetchApisQuery,
	type Api,
} from '@sdk/api';

export const apiQueryKeys = {
	all: ['apis'] as const,
	byDatabase: (databaseId: string) => ['apis', databaseId] as const,
	single: (databaseId: string, name: string) => ['apis', databaseId, name] as const,
};

export interface UseApisOptions {
	enabled?: boolean;
}

export function useApis(databaseId: string, options: UseApisOptions = {}) {
	return useQuery({
		queryKey: apiQueryKeys.byDatabase(databaseId),
		queryFn: async () => {
			const result = await fetchApisQuery({ condition: { databaseId } });
			return result.apis?.nodes ?? [];
		},
		enabled: options.enabled !== false && Boolean(databaseId),
	});
}

export type { Api };
