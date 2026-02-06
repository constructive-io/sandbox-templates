/**
 * Unified hooks system for table operations
 * Consolidates all table operations into a single, powerful hook
 */
import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as inflection from 'inflection';

import { useMeta } from '@/lib/gql/hooks/dashboard/use-dashboard-meta-query';
import { executeCrmInScope } from '@/graphql/execute';

import { type DashboardCacheScopeKey, useDashboardCacheScopeKey } from './use-dashboard-cache-scope';
import { dashboardQueryKeys } from './dashboard-query-keys';

import { cleanTable, type CleanTable, type MetaTable, type MutationOptions, type QueryOptions } from '../../data.types';
import { createError, parseError } from '../../error-handler';
import type { FieldSelection } from '../../field-selector';
import { prepareCreateInput, prepareUpdateInput } from '../../mutation-input';
import {
	buildCount,
	buildFindOne,
	buildPostGraphileCreate,
	buildPostGraphileDelete,
	buildPostGraphileUpdate,
	buildSelect,
	toCamelCasePlural,
} from '../../query-generator';

type RowRecord = Record<string, unknown>;

function extractRowId(row: RowRecord | null | undefined): string | number | null {
	if (!row || typeof row !== 'object') {
		return null;
	}

	const candidate = (row as RowRecord).id;
	return typeof candidate === 'string' || typeof candidate === 'number' ? candidate : null;
}

/**
 * Transform relation data by extracting nodes from hasMany/manyToMany connections
 */
function transformRelationData<TData extends RowRecord>(data: unknown, table: CleanTable): TData[] {
	if (!data) return [] as TData[];
	if (!Array.isArray(data)) return data as TData[];

	const transformed = data.map((row) => {
		if (!row || typeof row !== 'object') return row as TData;

		const transformedRow: RowRecord = { ...(row as RowRecord) };

		const hasManyRelations = table.relations.hasMany || [];
		const manyToManyRelations = table.relations.manyToMany || [];
		const connectionRelations = [...hasManyRelations, ...manyToManyRelations];

		connectionRelations.forEach((relation) => {
			const fieldName = relation.fieldName;
			if (!fieldName || !(fieldName in transformedRow)) return;

			const relationValue = transformedRow[fieldName];
			if (relationValue && typeof relationValue === 'object' && 'nodes' in (relationValue as RowRecord)) {
				const connectionData = relationValue as { nodes?: unknown[] };
				transformedRow[fieldName] = connectionData.nodes || [];
			}
		});

		return transformedRow as TData;
	});

	return transformed as TData[];
}

/**
 * Unified table hook options
 */
export interface UseTableOptions extends QueryOptions {
	/** Enable/disable automatic data fetching */
	enabled?: boolean;
	/** Field selection for queries */
	select?: FieldSelection;
	/** Mutation options */
	mutationOptions?: MutationOptions;
}

/**
 * Unified table hook result
 */
export interface UseTableResult<TData extends RowRecord = RowRecord> {
	// Data
	data: TData[];
	totalCount: number;
	isLoading: boolean;
	error: Error | null;

	// Single row operations
	findOne: (id: string | number) => Promise<TData | null>;

	// Mutations
	create: (data: RowRecord) => Promise<{ createdRow: TData | null }>;
	update: (id: string | number, patch: RowRecord) => Promise<{ updatedRow: TData | null }>;
	delete: (id: string | number) => Promise<{ deletedId: string | number }>;

	// Mutation states
	isCreating: boolean;
	isUpdating: boolean;
	isDeleting: boolean;

	// Mutation errors
	createError: Error | null;
	updateError: Error | null;
	deleteError: Error | null;

	// Utilities
	refetch: () => Promise<unknown>;
	invalidate: () => void;
}

/**
 * Generate query keys for consistent cache management
 */
export const queryKeys = {
	scope: (scope: DashboardCacheScopeKey) => dashboardQueryKeys.scope(scope),
	table: (scope: DashboardCacheScopeKey, tableName: string) => dashboardQueryKeys.table(scope, tableName),
	tableRows: (scope: DashboardCacheScopeKey, tableName: string, options?: QueryOptions) =>
		dashboardQueryKeys.tableRows(scope, tableName, options),
	tableRow: (scope: DashboardCacheScopeKey, tableName: string, id: unknown) =>
		dashboardQueryKeys.tableRow(scope, tableName, id),
	tableCount: (scope: DashboardCacheScopeKey, tableName: string, where?: Record<string, unknown>) =>
		dashboardQueryKeys.tableCount(scope, tableName, where),
};

/**
 * Transform QueryOptions to PostGraphile pagination variables
 */
function transformToPostGraphileVariables(table: CleanTable, options: QueryOptions = {}): Record<string, unknown> {
	const variables: Record<string, unknown> = {};

	// Transform limit to first (PostGraphile uses first for forward pagination)
	const limitValue = options.limit ?? options.first;
	if (limitValue !== undefined) {
		variables.first = limitValue;
	}

	// Keep offset as is (PostGraphile supports offset-based pagination)
	if (options.offset !== undefined) {
		variables.offset = options.offset;
	}

	// Add cursor-based pagination variables (for infinite scroll)
	if (options.after !== undefined) {
		variables.after = options.after;
	}
	if (options.before !== undefined) {
		variables.before = options.before;
	}

	// Transform orderBy to PostGraphile format
	// PostGraphile expects format like: ["ID_ASC", "NAME_DESC"]
	if (options.orderBy && options.orderBy.length > 0) {
		const availableFields = new Set(table.fields.map((field) => field.name));
		variables.orderBy = options.orderBy
			.filter(({ field }) => availableFields.has(field))
			.map(({ field, direction }) => `${field.toUpperCase()}_${direction.toUpperCase()}`);
	}

	// Add where/filter conditions if present
	if (options.where) {
		// PostGraphile uses 'filter' for complex conditions.
		variables.filter = options.where;
	}

	return variables;
}

/**
 * Main unified table hook
 * Returns all table operations in a single hook
 */
export function useTable<TData extends RowRecord = RowRecord>(
	tableName: string,
	options: UseTableOptions = {},
): UseTableResult<TData> {
	const queryClient = useQueryClient();
	const scopeKey = useDashboardCacheScopeKey();
	const { data: meta } = useMeta();

	const tables = useMemo<CleanTable[]>(() => {
		if (!meta?._meta?.tables) return [];

		return meta._meta.tables
			.filter((candidate): candidate is MetaTable => candidate != null)
			.map((metaTable) => cleanTable(metaTable));
	}, [meta]);

	const table = useMemo<CleanTable | null>(
		() => tables.find((candidate) => candidate.name === tableName) ?? null,
		[tables, tableName],
	);

	// Extract options
	const { enabled = true, select: fieldSelection, mutationOptions = {}, ...queryOptions } = options;

	// Update query options with field selection
	const finalQueryOptions: QueryOptions = {
		...queryOptions,
		fieldSelection,
	};

	// Data fetching with error handling
	const {
		data: rowsData = [] as TData[],
		isLoading,
		error,
		refetch,
	} = useQuery<TData[]>({
		queryKey: queryKeys.tableRows(scopeKey, tableName, finalQueryOptions),
		queryFn: async () => {
			if (!table) {
				throw createError.notFound(`Table '${tableName}' not found`);
			}

			const doc = buildSelect(table, tables, finalQueryOptions);

			// Transform QueryOptions to PostGraphile pagination variables
			const variables = transformToPostGraphileVariables(table, finalQueryOptions);

			const result = (await executeCrmInScope(
				{ endpoint: scopeKey.endpoint, authScope: scopeKey.databaseId ?? undefined },
				doc,
				variables,
			)) as Record<string, unknown>;

			// Handle Relay-style response structure
			const queryTableName = toCamelCasePlural(tableName);
			const data = result[queryTableName];

			if (data && typeof data === 'object' && 'nodes' in data) {
				// Relay-style response: { totalCount, nodes: [...] }
				const nodes = (data as { nodes: unknown[] }).nodes || [];
				return transformRelationData<TData>(nodes, table);
			}

			// Fallback for direct array response
			const directData = (data as unknown[]) || [];
			return transformRelationData<TData>(directData, table);
		},
		enabled: enabled && !!table,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	// Count fetching with error handling
	const { data: totalCount = 0 } = useQuery<number>({
		queryKey: queryKeys.tableCount(scopeKey, tableName, finalQueryOptions.where),
		queryFn: async () => {
			try {
				if (!table) {
					throw createError.notFound(`Table '${tableName}' not found`);
				}

				// For Relay-style APIs, we can get the count from the same query
				const doc = buildSelect(table, tables, { where: finalQueryOptions.where, limit: 1 }); // Just need 1 item to get totalCount

				// Transform options to PostGraphile variables
				const variables = transformToPostGraphileVariables(table, { where: finalQueryOptions.where, limit: 1 });

				const result = (await executeCrmInScope(
					{ endpoint: scopeKey.endpoint, authScope: scopeKey.databaseId ?? undefined },
					doc,
					variables,
				)) as Record<string, unknown>;

				const queryTableName = toCamelCasePlural(tableName);
				const data = result[queryTableName];

				if (data && typeof data === 'object' && 'totalCount' in data) {
					return (data as { totalCount: number }).totalCount || 0;
				}

				// Fallback: try the count query approach
				try {
					const countDoc = buildCount(table);
					const countResult = (await executeCrmInScope(
						{ endpoint: scopeKey.endpoint, authScope: scopeKey.databaseId ?? undefined },
						countDoc,
						{
							condition: finalQueryOptions.where,
							filter: finalQueryOptions.where,
						},
					)) as Record<string, unknown>;
					const queryTableName = toCamelCasePlural(tableName);
					return (countResult[queryTableName] as { totalCount: number })?.totalCount || 0;
				} catch {
					return 0;
				}
			} catch (error) {
				// For count queries, we can gracefully degrade to 0
				console.warn('Count query failed:', parseError(error).getUserMessage());
				return 0;
			}
		},
		enabled: enabled && !!table,
		staleTime: 1 * 60 * 1000, // 1 minute for counts
	});

	// Create mutation with error handling
	const createMutation = useMutation<
		{ createdRow: TData | null; __rawResult: Record<string, unknown> },
		Error,
		RowRecord
	>({
		mutationFn: async (data: RowRecord) => {
			if (!table) {
				throw createError.notFound(`Table '${tableName}' not found`);
			}

			// Get all tables for AST generation
			const allTables = meta?._meta?.tables
				? meta._meta.tables.filter((t): t is NonNullable<typeof t> => t != null).map(cleanTable)
				: [];

			// Use PostGraphile-specific AST-based mutation generation
			const doc = buildPostGraphileCreate(table, allTables, {
				...mutationOptions,
				fieldSelection: mutationOptions.fieldSelection || fieldSelection || 'display',
			});

			// PostGraphile expects variables in a specific format for create mutations
			// The mutation expects: { input: { tableName: { ... } } }
			const singularName = inflection.camelize(tableName, true);
			const sanitizedData = prepareCreateInput(data);
			const variables = {
				input: {
					[singularName]: sanitizedData,
				},
			};

			const result = (await executeCrmInScope(
				{ endpoint: scopeKey.endpoint, authScope: scopeKey.databaseId ?? undefined },
				doc,
				variables,
			)) as Record<string, unknown>;

			// Extract the created row from PostGraphile response
			const mutationName = `create${tableName}`;
			const createdRow = (result[mutationName] as Record<string, unknown>)?.[singularName] ?? null;

			return { createdRow: createdRow as TData | null, __rawResult: result };
		},
		onSuccess: ({ createdRow }: { createdRow: TData | null; __rawResult: Record<string, unknown> }) => {
			// Invalidate all related queries for paginated mode
			queryClient.invalidateQueries({ queryKey: queryKeys.table(scopeKey, tableName) });

			// Cross-invalidate infinite scroll queries to ensure both modes stay in sync
			queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.infiniteTable(scopeKey, tableName) });

			// Update individual row cache
			const createdRowId = extractRowId(createdRow as RowRecord | null);
			if (createdRowId !== null) {
				queryClient.setQueryData(queryKeys.tableRow(scopeKey, tableName, createdRowId), createdRow);
			}
		},
	});

	// Update mutation with error handling
	const updateMutation = useMutation<
		{ updatedRow: TData | null; __rawResult: Record<string, unknown> },
		Error,
		{ id: string | number; patch: RowRecord }
	>({
		mutationFn: async ({ id, patch }) => {
			if (!table) {
				throw createError.notFound(`Table '${tableName}' not found`);
			}

			// Get all tables for AST generation
			const allTables = meta?._meta?.tables
				? meta._meta.tables.filter((t): t is NonNullable<typeof t> => t != null).map(cleanTable)
				: [];

			// Use PostGraphile-specific AST-based mutation generation
			const doc = buildPostGraphileUpdate(table, allTables, {
				...mutationOptions,
				fieldSelection: mutationOptions.fieldSelection || fieldSelection || 'display',
			});

			// PostGraphile expects variables in a specific format for update mutations
			// The mutation expects: { input: { id: ..., patch: ... } }
			const sanitizedPatch = prepareUpdateInput(patch);
			if (Object.keys(sanitizedPatch).length === 0) {
				return { updatedRow: null as TData | null, __rawResult: {} };
			}
			const variables = {
				input: {
					id,
					patch: sanitizedPatch,
				},
			};

			const result = (await executeCrmInScope(
				{ endpoint: scopeKey.endpoint, authScope: scopeKey.databaseId ?? undefined },
				doc,
				variables,
			)) as Record<string, unknown>;

			// Extract the updated row from PostGraphile response
			const mutationName = `update${tableName}`;
			const singularName = tableName.charAt(0).toLowerCase() + tableName.slice(1);
			const updatedRow = (result[mutationName] as Record<string, unknown>)?.[singularName] ?? null;

			return { updatedRow: updatedRow as TData | null, __rawResult: result };
		},
		onSuccess: ({ updatedRow }: { updatedRow: TData | null; __rawResult: Record<string, unknown> }) => {
			// Invalidate all related queries for paginated mode
			queryClient.invalidateQueries({ queryKey: queryKeys.table(scopeKey, tableName) });

			// Cross-invalidate infinite scroll queries to ensure both modes stay in sync
			queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.infiniteTable(scopeKey, tableName) });

			// Update individual row cache
			const updatedRowId = extractRowId(updatedRow as RowRecord | null);
			if (updatedRowId !== null) {
				queryClient.setQueryData(queryKeys.tableRow(scopeKey, tableName, updatedRowId), updatedRow);
			}
		},
	});

	// Delete mutation with error handling
	const deleteMutation = useMutation<
		{ deletedId: string | number; __rawResult: Record<string, unknown> },
		Error,
		string | number
	>({
		mutationFn: async (id) => {
			if (!table) {
				throw createError.notFound(`Table '${tableName}' not found`);
			}

			// Get all tables for AST generation
			const allTables = meta?._meta?.tables
				? meta._meta.tables.filter((t): t is NonNullable<typeof t> => t != null).map(cleanTable)
				: [];

			// Use PostGraphile-specific AST-based mutation generation
			const doc = buildPostGraphileDelete(table, allTables, mutationOptions);

			// PostGraphile expects variables in a specific format for delete mutations
			// The mutation expects: { input: { id: ... } }
			const variables = {
				input: {
					id,
				},
			};

			const result = (await executeCrmInScope(
				{ endpoint: scopeKey.endpoint, authScope: scopeKey.databaseId ?? undefined },
				doc,
				variables,
			)) as Record<string, unknown>;

			return { deletedId: id, __rawResult: result };
		},
		onSuccess: ({ deletedId }: { deletedId: string | number; __rawResult: Record<string, unknown> }) => {
			// Invalidate all related queries for paginated mode
			queryClient.invalidateQueries({ queryKey: queryKeys.table(scopeKey, tableName) });

			// Cross-invalidate infinite scroll queries to ensure both modes stay in sync
			queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.infiniteTable(scopeKey, tableName) });

			// Remove individual row cache
			if (deletedId) {
				queryClient.removeQueries({
					queryKey: queryKeys.tableRow(scopeKey, tableName, deletedId),
				});
			}
		},
	});

	// Find one function with error handling
	const findOne = async (id: string | number) => {
		if (!table) {
			throw createError.notFound(`Table '${tableName}' not found`);
		}

		const doc = buildFindOne(table);
		const result = (await executeCrmInScope(
			{ endpoint: scopeKey.endpoint, authScope: scopeKey.databaseId ?? undefined },
			doc,
			{ id },
		)) as Record<string, unknown>;

		// Handle Relay-style response structure
		const queryTableName = toCamelCasePlural(tableName);
		const data = result[queryTableName];

		if (data && typeof data === 'object' && 'nodes' in data) {
			const nodes = (data as { nodes: unknown[] }).nodes || [];
			const transformedNodes = transformRelationData<TData>(nodes, table);
			return transformedNodes[0] || null;
		}

		// Fallback for direct array response
		const rows = (result[tableName] as unknown[]) || [];
		const transformedRows = transformRelationData<TData>(rows, table);
		return transformedRows[0] || null;
	};

	// Invalidate function
	const invalidate = () => {
		queryClient.invalidateQueries({ queryKey: queryKeys.table(scopeKey, tableName) });
	};

	return {
		// Data
		data: rowsData,
		totalCount,
		isLoading,
		error,

		// Single row operations
		findOne,

		// Mutations
		create: (data: RowRecord) => createMutation.mutateAsync(data),
		update: (id: string | number, patch: RowRecord) => updateMutation.mutateAsync({ id, patch }),
		delete: (id: string | number) => deleteMutation.mutateAsync(id),

		// Mutation states
		isCreating: createMutation.isPending,
		isUpdating: updateMutation.isPending,
		isDeleting: deleteMutation.isPending,

		// Mutation errors
		createError: createMutation.error,
		updateError: updateMutation.error,
		deleteError: deleteMutation.error,

		// Utilities
		refetch,
		invalidate,
	};
}
