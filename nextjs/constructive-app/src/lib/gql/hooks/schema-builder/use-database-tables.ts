/**
 * Hook for fetching tables within a specific database
 * Tier 4 wrapper: Uses SDK hooks + composition
 */
import { useQuery } from '@tanstack/react-query';

import {
	fetchFieldsQuery,
	fetchTableQuery,
	fetchTablesQuery,
} from '@sdk/api';

import {
	type DatabaseFieldNode,
	type DatabaseTableNode,
	type PageInfo,
	EMPTY_PAGE_INFO,
	transformField,
	transformTable,
	buildFieldsByTableMap,
	extractIds,
} from './database-shared-utils';

// Re-export shared types for backwards compatibility
export type { DatabaseFieldNode as DbFieldNode, DatabaseTableNode as DbTableNode };

interface DatabaseTablesQueryResult {
	tables: {
		nodes: DatabaseTableNode[];
		totalCount: number;
		pageInfo: PageInfo;
	} | null;
}

export interface UseDatabaseTablesOptions {
	/** Database ID to fetch tables for */
	databaseId: string;
	/** Number of tables to fetch (default: 50) */
	first?: number;
	/** Offset for pagination */
	offset?: number;
	/** Enable/disable the query */
	enabled?: boolean;
}

export interface UseDatabaseTablesResult {
	tables: DatabaseTableNode[];
	totalCount: number;
	isLoading: boolean;
	error: Error | null;
	pageInfo: PageInfo;
	refetch: () => Promise<unknown>;
}

/**
 * Hook for fetching tables within a specific database
 *
 * @example
 * ```tsx
 * const { tables, totalCount, isLoading } = useDatabaseTables({
 *   databaseId: 'database-uuid',
 * });
 * ```
 */
export function useDatabaseTables(options: UseDatabaseTablesOptions): UseDatabaseTablesResult {
	const { databaseId, first = 50, offset = 0, enabled = true } = options;

	const { data, isLoading, error, refetch } = useQuery<DatabaseTablesQueryResult, Error>({
		queryKey: databaseTablesQueryKeys.byDatabaseWithOptions(databaseId, { first, offset }),
		queryFn: async (): Promise<DatabaseTablesQueryResult> => {
			// Step 1: Fetch tables for this database
			const tablesResult = await fetchTablesQuery({
				filter: { databaseId: { equalTo: databaseId } },
				first,
				offset,
				orderBy: ['NAME_ASC'],
			});

			const tables = tablesResult.tables?.nodes ?? [];
			if (tables.length === 0) {
				return { tables: { nodes: [], totalCount: 0, pageInfo: EMPTY_PAGE_INFO } };
			}

			// Step 2: Fetch fields for all tables
			const tableIds = extractIds(tables);
			const fieldsResult = await fetchFieldsQuery({
				filter: { tableId: { in: tableIds } },
			});

			// Step 3: Build result with nested fields
			const fieldsByTable = buildFieldsByTableMap(fieldsResult.fields?.nodes ?? []);
			const tableNodes = tables.map((t) => transformTable(t, fieldsByTable.get(t.id ?? '') ?? []));

			return {
				tables: {
					nodes: tableNodes,
					totalCount: tablesResult.tables?.totalCount ?? 0,
					pageInfo: {
						hasNextPage: tablesResult.tables?.pageInfo?.hasNextPage ?? false,
						hasPreviousPage: tablesResult.tables?.pageInfo?.hasPreviousPage ?? false,
					},
				},
			};
		},
		enabled: enabled && !!databaseId,
		staleTime: 5 * 60 * 1000,
	});

	return {
		tables: data?.tables?.nodes ?? [],
		totalCount: data?.tables?.totalCount ?? 0,
		isLoading,
		error,
		pageInfo: data?.tables?.pageInfo ?? EMPTY_PAGE_INFO,
		refetch,
	};
}

/**
 * Hook for fetching a single table by ID
 */
export function useDatabaseTable(tableId: string, enabled = true) {
	return useQuery<DatabaseTableNode | null, Error>({
		queryKey: ['database-table', tableId],
		queryFn: async (): Promise<DatabaseTableNode | null> => {
			const tableResult = await fetchTableQuery({ id: tableId });
			const table = tableResult.table;
			if (!table) return null;

			const fieldsResult = await fetchFieldsQuery({
				filter: { tableId: { equalTo: tableId } },
			});

			const fields = (fieldsResult.fields?.nodes ?? []).map(transformField);
			return transformTable(table, fields);
		},
		enabled: enabled && !!tableId,
		staleTime: 5 * 60 * 1000,
	});
}

/**
 * Query keys for cache management
 */
export const databaseTablesQueryKeys = {
	all: ['database-tables'] as const,
	byDatabase: (databaseId: string) => [...databaseTablesQueryKeys.all, { databaseId }] as const,
	byDatabaseWithOptions: (databaseId: string, options: Omit<UseDatabaseTablesOptions, 'databaseId'>) =>
		[...databaseTablesQueryKeys.byDatabase(databaseId), options] as const,
};
