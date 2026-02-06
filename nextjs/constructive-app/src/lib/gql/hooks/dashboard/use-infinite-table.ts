/**
 * Infinite scroll table hook with hybrid cursor-based pagination
 *
 * Uses a hybrid pagination strategy:
 * - Page 0: Offset-based (`first: N`) to get initial data + endCursor
 * - Page N+1: Cursor-based (`first: N, after: endCursor`) for efficient deep pagination
 *
 * This leverages PostGraphile's Relay Connection spec for optimal performance on large datasets.
 *
 * Data Persistence:
 * - Uses React Query cache as the source of truth for page data
 * - Data survives component unmount/remount and route changes
 * - Only clears when table name or query options actually change (deep comparison)
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQueries, useQueryClient } from '@tanstack/react-query';

import { executeCrmInScope } from '@/graphql/execute';

import {
	cleanTable,
	type CleanTable,
	type ConnectionResult,
	type MetaTable,
	type MutationOptions,
	type PageInfo,
	type QueryOptions,
} from '../../data.types';
import { createError } from '../../error-handler';
import type { FieldSelection } from '../../field-selector';
import { buildSelect, toCamelCasePlural } from '../../query-generator';
import { useMeta } from './use-dashboard-meta-query';
import { type DashboardCacheScopeKey, useDashboardCacheScopeKey } from './use-dashboard-cache-scope';
import { dashboardQueryKeys } from './dashboard-query-keys';

type RowRecord = Record<string, unknown>;

/** Data for a single loaded page */
export interface PageData<T = RowRecord> {
	rows: T[];
	pageInfo: PageInfo;
	pageIndex: number;
	totalCount?: number;
}

/** Options for the infinite table hook */
export interface UseInfiniteTableOptions {
	/** Page size for fetching */
	pageSize?: number;
	/** Order by clauses */
	orderBy?: Array<{ field: string; direction: 'asc' | 'desc' }>;
	/** Filter conditions */
	where?: Record<string, unknown>;
	/** Field selection preset or custom selection */
	select?: FieldSelection;
	/** Enable/disable the hook */
	enabled?: boolean;
	/** Mutation options for CRUD operations */
	mutationOptions?: MutationOptions;
}

/** Result from the infinite table hook */
export interface UseInfiniteTableResult<T = RowRecord> {
	/** Get row at a specific index, returns null if not loaded */
	getRowAtIndex: (index: number) => T | null;
	/** Total count of rows in the table */
	totalCount: number;
	/** Check if a specific row index is loaded */
	isRowLoaded: (rowIndex: number) => boolean;
	/** Check if a specific page is currently loading */
	isPageLoading: (pageIndex: number) => boolean;
	/** Ensure rows in a range are loaded (call from onVisibleRegionChanged) */
	ensureRowsLoaded: (startRow: number, endRow: number) => void;
	/** All loaded pages */
	loadedPages: Map<number, PageData<T>>;
	/** Page size */
	pageSize: number;
	/** Overall loading state (true if any page is loading) */
	isLoading: boolean;
	/** Whether initial data has been loaded */
	hasInitialData: boolean;
	/** Error from the most recent failed fetch */
	error: Error | null;
	/** Invalidate all pages and refetch */
	invalidate: () => void;
	/** Reset to initial state (clears all pages, refetches page 0) */
	reset: () => void;
	/**
	 * Optimistically update a single row in the page cache without refetching.
	 * @param rowIndex The absolute row index
	 * @param patch Partial row data to merge with existing row
	 * @returns true if the row was found and updated, false otherwise
	 */
	updateRowAtIndex: (rowIndex: number, patch: Partial<T>) => boolean;
}

/** Query key factory for infinite table pages */
const infiniteTableKeys = {
	all: (scope: DashboardCacheScopeKey, tableName: string) => dashboardQueryKeys.infiniteTable(scope, tableName),
	page: (scope: DashboardCacheScopeKey, tableName: string, pageIndex: number, optionsKey: string) =>
		[...dashboardQueryKeys.infiniteTable(scope, tableName), 'page', pageIndex, optionsKey] as const,
	totalCount: (scope: DashboardCacheScopeKey, tableName: string, where?: Record<string, unknown>) =>
		dashboardQueryKeys.infiniteTableTotalCount(scope, tableName, where),
};

/**
 * Create a stable JSON key from options for deep comparison.
 * This ensures the key only changes when the actual values change, not object references.
 */
function createStableOptionsKey(options: {
	pageSize: number;
	orderBy?: Array<{ field: string; direction: 'asc' | 'desc' }>;
	where?: Record<string, unknown>;
	fieldSelection?: FieldSelection;
}): string {
	return JSON.stringify({
		pageSize: options.pageSize,
		orderBy: options.orderBy ?? null,
		where: options.where ?? null,
		fieldSelection: options.fieldSelection ?? null,
	});
}

/**
 * Transform relation data by extracting nodes from hasMany/manyToMany connections
 */
function transformRelationData<T extends RowRecord>(data: unknown[], table: CleanTable): T[] {
	if (!data || !Array.isArray(data)) return [] as T[];

	return data.map((row) => {
		if (!row || typeof row !== 'object') return row as T;

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

		return transformedRow as T;
	}) as T[];
}

/**
 * Hook for infinite scroll table with hybrid cursor-based pagination.
 * Uses React Query cache as the source of truth for data persistence.
 */
export function useInfiniteTable<T extends RowRecord = RowRecord>(
	tableName: string,
	options: UseInfiniteTableOptions = {},
): UseInfiniteTableResult<T> {
	const { pageSize = 100, orderBy, where, select: fieldSelection, enabled = true } = options;

	const queryClient = useQueryClient();
	const scopeKey = useDashboardCacheScopeKey();
	const { data: meta } = useMeta();

	// Create stable options key using JSON serialization for deep comparison
	const stableOptionsKey = useMemo(
		() => createStableOptionsKey({ pageSize, orderBy, where, fieldSelection }),
		[pageSize, orderBy, where, fieldSelection],
	);

	// Track which pages we want to load
	const [requestedPages, setRequestedPages] = useState<Set<number>>(() => new Set([0]));

	// Cursor chain for cursor-based pagination (stored in ref for performance)
	const cursorChainRef = useRef<Map<number, string>>(new Map());
	const [cursorChainVersion, setCursorChainVersion] = useState(0);

	// Track latest total count from any page response
	const totalCountRef = useRef<number>(0);

	// Track previous stable key to detect actual changes
	const prevStableKeyRef = useRef<string>(stableOptionsKey);
	const prevTableNameRef = useRef<string>(tableName);

	// Get table metadata
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

	// Reset state only when table name or options actually change (not on every render)
	useEffect(() => {
		const tableChanged = prevTableNameRef.current !== tableName;
		const optionsChanged = prevStableKeyRef.current !== stableOptionsKey;

		if (tableChanged || optionsChanged) {
			// Clear cursor chain (cursors are invalidated by option changes)
			cursorChainRef.current.clear();
			totalCountRef.current = 0;
			setCursorChainVersion(0);
			setRequestedPages(new Set([0]));

			// Update refs
			prevTableNameRef.current = tableName;
			prevStableKeyRef.current = stableOptionsKey;

			// Invalidate React Query cache for this table's infinite queries
			// This ensures stale data from different options isn't served
			queryClient.invalidateQueries({
				queryKey: infiniteTableKeys.all(scopeKey, tableName),
			});
		}
	}, [tableName, stableOptionsKey, queryClient, scopeKey]);

	// Helper to get page data from React Query cache
	const getPageDataFromCache = useCallback(
		(pageIndex: number): PageData<T> | undefined => {
			return queryClient.getQueryData<PageData<T>>(
				infiniteTableKeys.page(scopeKey, tableName, pageIndex, stableOptionsKey),
			);
		},
		[queryClient, scopeKey, tableName, stableOptionsKey],
	);

	// Create query options for each requested page
	const pageQueries = useMemo(() => {
		if (!table || !enabled) return [];
		// Force recompute when cursor chain advances
		void cursorChainVersion;

		return Array.from(requestedPages).map((pageIndex) => {
			// Determine pagination strategy
			const isFirstPage = pageIndex === 0;
			const previousCursor = pageIndex > 0 ? cursorChainRef.current.get(pageIndex - 1) : undefined;
			// Pages:
			// - 0: always fetch
			// - 1: wait for cursor from page 0 (prefer cursor-based)
			// - 2+: allow offset fallback (supports scrollbar jumps without loading all intermediate pages)
			const canUseOffsetFallback = pageIndex >= 2;
			const canFetch = isFirstPage || previousCursor !== undefined || canUseOffsetFallback;

			return {
				queryKey: infiniteTableKeys.page(scopeKey, tableName, pageIndex, stableOptionsKey),
				queryFn: async (): Promise<PageData<T>> => {
					if (!table) {
						throw createError.notFound(`Table '${tableName}' not found`);
					}

					// Build query options
					const queryOptions: QueryOptions = {
						first: pageSize,
						orderBy,
						where: where as QueryOptions['where'],
						fieldSelection,
						includePageInfo: true, // Always include for cursor chain
					};

					// Prefer cursor-based pagination when possible; allow offset fallback for deep jumps.
					if (!isFirstPage) {
						if (previousCursor) {
							queryOptions.after = previousCursor;
						} else if (canUseOffsetFallback) {
							queryOptions.offset = pageIndex * pageSize;
						}
					}

					const doc = buildSelect(table, tables, queryOptions);

					// Build variables
					const variables: Record<string, unknown> = {
						first: pageSize,
					};

					if (!isFirstPage) {
						if (previousCursor) {
							variables.after = previousCursor;
						} else if (canUseOffsetFallback) {
							variables.offset = pageIndex * pageSize;
						}
					}

					if (orderBy && orderBy.length > 0) {
						const availableFields = new Set(table.fields.map((field) => field.name));
						variables.orderBy = orderBy
							.filter(({ field }) => availableFields.has(field))
							.map(({ field, direction }) => `${field.toUpperCase()}_${direction.toUpperCase()}`);
					}

					if (where) {
						variables.filter = where;
					}

					const result = (await executeCrmInScope(
						{ endpoint: scopeKey.endpoint, authScope: scopeKey.databaseId ?? undefined },
						doc,
						variables,
					)) as Record<string, unknown>;

					// Parse response
					const queryTableName = toCamelCasePlural(tableName);
					const connectionData = result[queryTableName] as ConnectionResult<T> | undefined;

					if (!connectionData) {
						throw createError.unknown(new Error(`No data returned for table '${tableName}'`));
					}

					const rows = transformRelationData<T>(connectionData.nodes || [], table);
					const pageInfo = connectionData.pageInfo || {
						hasNextPage: false,
						hasPreviousPage: false,
						endCursor: null,
						startCursor: null,
					};

					// Update total count ref
					if (connectionData.totalCount !== undefined) {
						totalCountRef.current = connectionData.totalCount;
					}

					// Store cursor for next page (and bump version so dependent pages can enable)
					if (pageInfo.endCursor) {
						const prev = cursorChainRef.current.get(pageIndex);
						if (prev !== pageInfo.endCursor) {
							cursorChainRef.current.set(pageIndex, pageInfo.endCursor);
							setCursorChainVersion((v) => v + 1);
						}
					}

					const pageData: PageData<T> = {
						rows,
						pageInfo,
						pageIndex,
						totalCount: connectionData.totalCount,
					};

					return pageData;
				},
				enabled: enabled && !!table && canFetch,
				staleTime: 5 * 60 * 1000, // 5 minutes
				gcTime: 10 * 60 * 1000, // 10 minutes
			};
		});
	}, [
		table,
		tables,
		tableName,
		enabled,
		scopeKey,
		requestedPages,
		stableOptionsKey,
		pageSize,
		orderBy,
		where,
		fieldSelection,
		cursorChainVersion,
	]);

	// Execute all page queries
	const queryResults = useQueries({ queries: pageQueries });

	// Sync cursor chain from React Query cache on mount/rehydration
	// This restores cursors for pages that were cached but cursor chain was lost
	useEffect(() => {
		if (!enabled || !table) return;

		// Check React Query cache for existing page data and restore cursors
		for (let i = 0; i < 100; i++) {
			// Check up to 100 pages
			const cachedData = getPageDataFromCache(i);
			if (cachedData?.pageInfo?.endCursor && !cursorChainRef.current.has(i)) {
				cursorChainRef.current.set(i, cachedData.pageInfo.endCursor);
			}
			if (cachedData?.totalCount !== undefined) {
				totalCountRef.current = cachedData.totalCount;
			}
			if (!cachedData) break; // Stop at first missing page
		}
	}, [enabled, table, getPageDataFromCache]);

	// Compute loading states
	const isLoading = queryResults.some((result) => result.isLoading);

	// Check if we have initial data - either from current query or from cache
	const hasInitialData = useMemo(() => {
		// Check query results first
		const page0Query = queryResults.find((_, idx) => Array.from(requestedPages)[idx] === 0);
		if (page0Query?.data) return true;

		// Fall back to cache check
		const cachedPage0 = getPageDataFromCache(0);
		return cachedPage0 !== undefined;
	}, [queryResults, requestedPages, getPageDataFromCache]);

	const error = queryResults.find((result) => result.error)?.error ?? null;

	// Get row at index - reads from React Query cache
	// IMPORTANT: Always read from cache first since optimistic updates use setQueryData
	// which updates cache but doesn't immediately update queryResults references
	const getRowAtIndex = useCallback(
		(rowIndex: number): T | null => {
			const pageIndex = Math.floor(rowIndex / pageSize);
			const rowIndexInPage = rowIndex % pageSize;

			// Always read from React Query cache first - this ensures we get optimistically
			// updated data from setQueryData calls (used in updateRowAtIndex)
			const cachedData = getPageDataFromCache(pageIndex);
			if (cachedData) {
				return cachedData.rows[rowIndexInPage] ?? null;
			}

			// Fall back to query results if cache miss (shouldn't happen normally)
			const queryIndex = Array.from(requestedPages).indexOf(pageIndex);
			if (queryIndex !== -1 && queryResults[queryIndex]?.data) {
				const pageData = queryResults[queryIndex].data;
				return pageData.rows[rowIndexInPage] ?? null;
			}

			return null;
		},
		[pageSize, getPageDataFromCache, requestedPages, queryResults],
	);

	// Check if row is loaded - reads from cache first for consistency with getRowAtIndex
	const isRowLoaded = useCallback(
		(rowIndex: number): boolean => {
			const pageIndex = Math.floor(rowIndex / pageSize);
			const rowIndexInPage = rowIndex % pageSize;

			// Check cache first (consistent with getRowAtIndex)
			const cachedData = getPageDataFromCache(pageIndex);
			if (cachedData) {
				return rowIndexInPage < cachedData.rows.length;
			}

			// Fallback to query results
			const queryIndex = Array.from(requestedPages).indexOf(pageIndex);
			if (queryIndex !== -1 && queryResults[queryIndex]?.data) {
				return rowIndexInPage < queryResults[queryIndex].data.rows.length;
			}

			return false;
		},
		[pageSize, getPageDataFromCache, requestedPages, queryResults],
	);

	// Check if page is loading
	const isPageLoading = useCallback(
		(pageIndex: number): boolean => {
			const queryIndex = Array.from(requestedPages).indexOf(pageIndex);
			if (queryIndex === -1) return false;
			return queryResults[queryIndex]?.isLoading ?? false;
		},
		[requestedPages, queryResults],
	);

	// Ensure rows in range are loaded
	const ensureRowsLoaded = useCallback(
		(startRow: number, endRow: number) => {
			const startPage = Math.floor(Math.max(0, startRow) / pageSize);
			const endPage = Math.floor(Math.max(0, endRow - 1) / pageSize);

			const minPage = Math.max(0, startPage);
			const maxPage = endPage;

			setRequestedPages((prev) => {
				const next = new Set(prev);
				let changed = false;

				const maxPossiblePage =
					totalCountRef.current > 0 ? Math.max(0, Math.ceil(totalCountRef.current / pageSize) - 1) : null;
				const cappedMaxPage = maxPossiblePage === null ? maxPage : Math.min(maxPage, maxPossiblePage);

				for (let page = minPage; page <= cappedMaxPage; page++) {
					if (!next.has(page)) {
						next.add(page);
						changed = true;
					}
				}

				return changed ? next : prev;
			});
		},
		[pageSize],
	);

	// Build loadedPages map from React Query cache for backward compatibility
	const loadedPages = useMemo(() => {
		const map = new Map<number, PageData<T>>();

		// Add data from current query results
		Array.from(requestedPages).forEach((pageIndex, idx) => {
			const result = queryResults[idx];
			if (result?.data) {
				map.set(pageIndex, result.data);
			}
		});

		return map;
	}, [requestedPages, queryResults]);

	// Compute total count from query results or ref
	const totalCount = useMemo(() => {
		// Try to get from latest query result
		for (const result of queryResults) {
			if (result.data?.totalCount !== undefined) {
				return result.data.totalCount;
			}
		}
		return totalCountRef.current;
	}, [queryResults]);

	// Invalidate all pages
	const invalidate = useCallback(() => {
		// Clear cursor chain
		cursorChainRef.current.clear();
		totalCountRef.current = 0;
		setCursorChainVersion(0);

		// Reset to page 0
		setRequestedPages(new Set([0]));

		// Invalidate React Query cache
		queryClient.invalidateQueries({ queryKey: infiniteTableKeys.all(scopeKey, tableName) });
	}, [queryClient, scopeKey, tableName]);

	// Reset to initial state
	const reset = useCallback(() => {
		invalidate();
	}, [invalidate]);

	// Optimistically update a single row in the React Query cache
	const updateRowAtIndex = useCallback(
		(rowIndex: number, patch: Partial<T>): boolean => {
			const pageIndex = Math.floor(rowIndex / pageSize);
			const rowIndexInPage = rowIndex % pageSize;

			const queryKey = infiniteTableKeys.page(scopeKey, tableName, pageIndex, stableOptionsKey);
			const cachedData = queryClient.getQueryData<PageData<T>>(queryKey);

			if (!cachedData || !cachedData.rows[rowIndexInPage]) {
				return false;
			}

			// Update the cache optimistically
			queryClient.setQueryData<PageData<T>>(queryKey, (old) => {
				if (!old) return old;

				const newRows = [...old.rows];
				newRows[rowIndexInPage] = { ...newRows[rowIndexInPage], ...patch } as T;

				return {
					...old,
					rows: newRows,
				};
			});

			return true;
		},
		[pageSize, queryClient, scopeKey, tableName, stableOptionsKey],
	);

	return {
		getRowAtIndex,
		totalCount,
		isRowLoaded,
		isPageLoading,
		ensureRowsLoaded,
		loadedPages,
		pageSize,
		isLoading,
		hasInitialData,
		error: error as Error | null,
		invalidate,
		reset,
		updateRowAtIndex,
	};
}

/**
 * Export query keys for external cache management
 */
export { infiniteTableKeys };
