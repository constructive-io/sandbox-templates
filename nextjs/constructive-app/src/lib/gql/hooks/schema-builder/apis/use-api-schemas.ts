/**
 * Hook for fetching API schemas
 * @migrated Uses generated SDK from @constructive-io/graphql-codegen
 */

import { useQuery } from '@tanstack/react-query';

import { fetchApiSchemasQuery } from '@sdk/api';

export const apiSchemaQueryKeys = {
	all: ['api-schemas'] as const,
	byApi: (apiId: string) => ['api-schemas', apiId] as const,
	single: (apiId: string, schemaId: string) => ['api-schemas', apiId, schemaId] as const,
};

export interface UseApiSchemaOptions {
	enabled?: boolean;
}

export function useApiSchema(
	apiId: string,
	databaseId: string,
	schemaId: string,
	options: UseApiSchemaOptions = {}
) {
	return useQuery({
		queryKey: apiSchemaQueryKeys.single(apiId, schemaId),
		queryFn: async () => {
			const result = await fetchApiSchemasQuery({
				condition: { apiId, databaseId, schemaId },
				first: 1,
			});
			return result.apiSchemas?.nodes?.[0] ?? null;
		},
		enabled: options.enabled !== false && Boolean(apiId && databaseId && schemaId),
	});
}
