/**
 * Hook for integrating infinite scroll with the data grid
 * Wraps useInfiniteTable and provides grid-specific utilities
 */
import { useCallback, useMemo } from 'react';
import { GridCellKind, type GridCell, type Rectangle } from '@glideapps/glide-data-grid';

import type { MetaField, MetaTable } from '@/lib/dynamic-form';
import { buildEnhancedFieldMetaMap } from '@/lib/gql/hooks/dashboard/enhance-field-with-smart-tags';
import { useMeta } from '@/lib/gql/hooks/dashboard/use-dashboard-meta-query';
import { useInfiniteTable, type UseInfiniteTableOptions } from '@/lib/gql/hooks/dashboard/use-infinite-table';
import { useFieldSmartTags } from '@/lib/gql/hooks/schema-builder/use-field-smart-tags';
import { useDashboardCacheScopeKey } from '@/lib/gql/hooks/dashboard/use-dashboard-cache-scope';

import { normalizeServerRow } from '../data-grid.utils';

type RowRecord = Record<string, unknown>;

export interface UseInfiniteGridDataOptions extends Omit<UseInfiniteTableOptions, 'select'> {
	tableName: string;
	enabledRelations?: string[];
}

export interface UseInfiniteGridDataResult {
	/** Get row at index, returns null if not loaded */
	getRowAtIndex: (index: number) => RowRecord | null;
	/** Total count of rows */
	totalCount: number;
	/** Check if row is loaded */
	isRowLoaded: (rowIndex: number) => boolean;
	/** Handler for onVisibleRegionChanged */
	onVisibleRegionChanged: (range: Rectangle) => void;
	/** Whether data is loading */
	isLoading: boolean;
	/** Whether initial data has been fetched */
	hasInitialData: boolean;
	/** Error if any */
	error: Error | null;
	/** Invalidate and refetch all data */
	invalidate: () => void;
	/**
	 * Optimistically update a single row in the cache without refetching.
	 * Used after successful cell edits to avoid full grid refresh.
	 * @param rowIndex The index of the row to update
	 * @param patch Partial row data to merge with existing row
	 */
	updateRowAtIndex: (rowIndex: number, patch: Partial<RowRecord>) => void;
	/** Table metadata */
	tableMeta: MetaTable | null;
	/** Field metadata map */
	fieldMetaMap: Map<string, MetaField>;
	/** All relation field names */
	allRelationFields: string[];
	/** Page size */
	pageSize: number;
	/** Create a loading cell for unloaded rows */
	createLoadingCell: () => GridCell;
}

/**
 * Hook that provides infinite scroll data loading for the grid
 */
export function useInfiniteGridData({
	tableName,
	pageSize = 100,
	orderBy,
	where,
	enabled = true,
	enabledRelations = [],
}: UseInfiniteGridDataOptions): UseInfiniteGridDataResult {
	// Get metadata
	const { data: meta } = useMeta();
	// Get databaseId for smartTags fetch
	const scopeKey = useDashboardCacheScopeKey();
	// Get smartTags from schema-builder (for Upload/custom type rendering)
	const { smartTagsMap } = useFieldSmartTags({ databaseId: scopeKey.databaseId });

	const tableMeta = useMemo<MetaTable | null>(() => {
		const candidate = meta?._meta?.tables?.find((t) => t?.name === tableName) as MetaTable | undefined;
		return candidate ?? null;
	}, [meta, tableName]);

	// Field metadata map for quick lookup, enhanced with smartTags
	// This fixes Upload type rendering: smartTags.pgAlias="upload" overrides _meta.pgAlias="text"
	const fieldMetaMap = useMemo(() => {
		const candidate = meta?._meta?.tables?.find((t) => t?.name === tableName) as MetaTable | undefined;
		const fields = (candidate?.fields as MetaField[]) || [];
		return buildEnhancedFieldMetaMap(fields, tableName, smartTagsMap);
	}, [meta, tableName, smartTagsMap]);

	// Get all relation field names
	const allRelationFields = useMemo<string[]>(() => {
		const relations = tableMeta?.relations;
		if (!relations) return [];

		const out: string[] = [];
		const push = (fieldName?: string | null) => {
			if (!fieldName) return;
			out.push(fieldName);
		};

		relations.belongsTo?.forEach((rel: any) => push(rel?.fieldName));
		relations.hasOne?.forEach((rel: any) => push(rel?.fieldName));
		relations.hasMany?.forEach((rel: any) => push(rel?.fieldName));
		relations.manyToMany?.forEach((rel: any) => push(rel?.fieldName));

		return Array.from(new Set(out));
	}, [tableMeta]);

	const relationFieldNames = useMemo(() => new Set(allRelationFields), [allRelationFields]);

	// Create stable key for enabledRelations to prevent unnecessary re-renders
	// JSON.stringify ensures deep comparison instead of reference comparison
	const enabledRelationsKey = useMemo(
		() => JSON.stringify([...enabledRelations].sort()),
		[enabledRelations],
	);

	// Build field selection with relations - memoized on stable key
	const fieldSelection = useMemo(() => {
		if (enabledRelations.length === 0) return 'all' as const;
		return { includeRelations: enabledRelations };
		// eslint-disable-next-line react-hooks/exhaustive-deps -- enabledRelationsKey provides stable comparison
	}, [enabledRelationsKey]);

	// Use the infinite table hook
	const infiniteTable = useInfiniteTable<RowRecord>(tableName, {
		pageSize,
		orderBy,
		where,
		select: fieldSelection,
		enabled,
	});

	// Get row at index with normalization
	// Note: We don't cache normalized rows because optimistic updates change the underlying
	// data without changing the row id. Caching by id causes stale data to be returned.
	// Normalization is cheap enough to do on every access.
	const getRowAtIndex = useCallback(
		(rowIndex: number): RowRecord | null => {
			const rawRow = infiniteTable.getRowAtIndex(rowIndex);
			if (rawRow === null) return null;

			// Always normalize - caching caused stale data issues with optimistic updates
			// because the cache key (id) doesn't change when other fields are updated
			return normalizeServerRow(rawRow, relationFieldNames);
		},
		[infiniteTable, relationFieldNames],
	);

	// Handler for onVisibleRegionChanged
	const onVisibleRegionChanged = useCallback(
		(range: Rectangle) => {
			const startRow = range.y;
			const endRow = range.y + range.height;

			// Add buffer for smoother scrolling
			const buffer = Math.ceil(pageSize / 2);
			infiniteTable.ensureRowsLoaded(Math.max(0, startRow - buffer), endRow + buffer);
		},
		[infiniteTable, pageSize],
	);

	// Create a loading cell
	const createLoadingCell = useCallback((): GridCell => {
		return {
			kind: GridCellKind.Loading,
			allowOverlay: false,
		};
	}, []);

	// Invalidate and refetch
	const invalidate = useCallback(() => {
		infiniteTable.invalidate();
	}, [infiniteTable]);

	// Optimistically update a single row without refetching
	const updateRowAtIndex = useCallback(
		(rowIndex: number, patch: Partial<RowRecord>) => {
			// Update the underlying React Query page cache
			// getRowAtIndex will return the updated data on next access
			infiniteTable.updateRowAtIndex(rowIndex, patch);
		},
		[infiniteTable],
	);

	return {
		getRowAtIndex,
		totalCount: infiniteTable.totalCount,
		isRowLoaded: infiniteTable.isRowLoaded,
		onVisibleRegionChanged,
		isLoading: infiniteTable.isLoading,
		hasInitialData: infiniteTable.hasInitialData,
		error: infiniteTable.error,
		invalidate,
		updateRowAtIndex,
		tableMeta,
		fieldMetaMap,
		allRelationFields,
		pageSize,
		createLoadingCell,
	};
}
