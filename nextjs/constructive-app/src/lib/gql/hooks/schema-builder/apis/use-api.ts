/**
 * Hook for fetching a single API by database and name
 * @migrated Uses generated SDK from @constructive-io/graphql-codegen
 */

import { useQuery } from '@tanstack/react-query';

import { fetchApiByDatabaseIdAndNameQuery } from '@sdk/api';

import { apiQueryKeys } from './use-apis';

export interface UseApiOptions {
	enabled?: boolean;
}

export function useApi(databaseId: string, name: string, options: UseApiOptions = {}) {
	return useQuery({
		queryKey: apiQueryKeys.single(databaseId, name),
		queryFn: async () => {
			const result = await fetchApiByDatabaseIdAndNameQuery({ databaseId, name });
			return result.apiByDatabaseIdAndName ?? null;
		},
		enabled: options.enabled !== false && Boolean(databaseId && name),
	});
}
