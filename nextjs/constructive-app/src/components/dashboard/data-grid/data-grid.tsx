'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import DataEditor, {
	GridCell,
	GridCellKind,
	GridSelection,
	Item,
	type DataEditorRef,
	type Highlight,
	type Rectangle,
} from '@glideapps/glide-data-grid';
import { RiDeleteBin6Line, RiLoader4Line, RiSendPlaneLine } from '@remixicon/react';
import { AnimatePresence, motion } from 'motion/react';

import { useMeasure } from '@/hooks/use-measure';
import { useDataGridColumns } from '@/lib/gql/hooks/dashboard/use-relation-columns';
import { springs, variants } from '@/lib/motion/motion-config';
import { useEntityParams } from '@/lib/navigation';
import { detectSchemaContextFromPath } from '@/lib/runtime/config-core';
import { cn } from '@/lib/utils';
import { computeDraftMetaSignature } from '@/store/draft-rows-slice';
import { Button } from '@constructive-io/ui/button';
import { Dock } from '@constructive-io/ui/dock';
import { toast } from '@constructive-io/ui/toast';
import { ClientOnly } from '@/components/client-only';
import type { DataGridProps } from '@/components/dashboard/data-grid/data-grid.types';

import { allCustomCells, createGeometryCell } from './custom-cells';
import { DRAFT_ACTION_COLUMN_KEY } from './data-grid.constants';
import { DataGridV2Controls } from './data-grid.controls';
import { createDrawCellCallback } from './draw-relation-badge';
import { FloatingStatus, FeedbackProvider, useFeedback } from './feedback';
import { DataGridV2Pagination } from './data-grid.pagination';
import { useDataGridTheme } from './data-grid.theme';
import {
	createColumnResizeHandler,
	createHeaderClickHandler,
	mapFromFieldMetaMap,
	mapFromRelationInfoMap,
	normalizeServerRow,
} from './data-grid.utils';
import type { DraftSubmitResult } from './editor-registry';
import { useCellEditing } from './hooks/use-cell-editing';
import { useDraftActionColumn } from './hooks/use-draft-action-column';
import { useDraftRows } from './hooks/use-draft-rows';
import { useDraftSubmission } from './hooks/use-draft-submission';
import { useGridContent } from './hooks/use-grid-content';
import { useGridEditors } from './hooks/use-grid-editors';
import { useGridOperations } from './hooks/use-grid-operations';
import { useGridSelectionState } from './hooks/use-grid-selection';
import { useGridState } from './hooks/use-grid-state';
import { useInfiniteGridData } from './hooks/use-infinite-grid-data';
import { useDataLoading } from './hooks/use-load-grid';

export function DataGridV2(props: DataGridProps) {
	return (
		<FeedbackProvider>
			<DataGridV2Inner {...props} />
		</FeedbackProvider>
	);
}

function DataGridV2Inner({
	tableName,
	className,
	pageSize = 100,
	showSelection = true,
	showPagination = true,
	onRowSelect,
	onCellEdit,
	relationChipLimit,
	relationLabelMaxLength,
	infiniteScroll = false,
}: DataGridProps) {
	const [containerRef, bounds] = useMeasure<HTMLDivElement>();

	// Refs for component measurements
	const controlsRef = useRef<HTMLDivElement>(null);
	const paginationRef = useRef<HTMLDivElement>(null);
	const [showSearch, setShowSearch] = useState(false);
	const [searchValue, setSearchValue] = useState('');

	// Get feedback context for bulk operation status indicators
	const { startOperation, updateOperationProgress, completeOperation } = useFeedback();

	// Get reactive theme with proper light/dark mode support
	const { theme: themeOverrides, rowMarkerTheme } = useDataGridTheme();

	const pathname = usePathname();
	const schemaContext = detectSchemaContextFromPath(pathname || '/') || 'default';
	const { databaseId } = useEntityParams();
	const tableKey = useMemo(() => {
		if (databaseId) return `${schemaContext}::${databaseId}::${tableName}`;
		return `${schemaContext}::${tableName}`;
	}, [schemaContext, databaseId, tableName]);

	// Centralized state management
	const { state: gridState, actions: gridActions } = useGridState();
	const setEnabledRelations = gridActions.setEnabledRelations;

	// Build orderBy from grid state
	const orderByClause = useMemo(
		() =>
			gridState.sorting.id
				? [{ field: gridState.sorting.id, direction: gridState.sorting.desc ? ('desc' as const) : ('asc' as const) }]
				: undefined,
		[gridState.sorting],
	);

	// ============== INFINITE SCROLL MODE ==============
	const infiniteGridData = useInfiniteGridData({
		tableName,
		pageSize,
		orderBy: orderByClause,
		enabledRelations: gridState.enabledRelations,
		enabled: infiniteScroll,
	});

	// ============== PAGINATED MODE ==============
	const initialQueryOptions = useMemo(
		() => ({
			limit: pageSize,
			offset: gridState.pageIndex * pageSize,
			orderBy: orderByClause,
		}),
		[pageSize, gridState.pageIndex, orderByClause],
	);

	// Note: useDataLoading is always enabled because we need its mutation functions (update/create/delete)
	// even in infinite scroll mode. In infinite scroll mode, we just don't use its data for display.
	const dataLoadingResult = useDataLoading({
		tableName,
		queryOptions: initialQueryOptions,
		enabledRelations: gridState.enabledRelations,
		autoIncludeRelations: false,
		enabled: true,
	});

	// ============== UNIFIED DATA ACCESS ==============
	// Choose data source based on mode
	const {
		serverData,
		totalCount,
		tableMeta,
		fieldMetaMap,
		allRelationFields,
		hasCompletedInitialLoad,
	} = useMemo(() => {
		if (infiniteScroll) {
			return {
				serverData: [] as any[], // Not used directly in infinite mode
				totalCount: infiniteGridData.totalCount,
				tableMeta: infiniteGridData.tableMeta,
				fieldMetaMap: infiniteGridData.fieldMetaMap,
				allRelationFields: infiniteGridData.allRelationFields,
				hasCompletedInitialLoad: infiniteGridData.hasInitialData,
			};
		}
		return {
			serverData: dataLoadingResult.contextValue.data || [],
			totalCount: dataLoadingResult.contextValue.totalCount,
			tableMeta: dataLoadingResult.contextValue.tableMeta,
			fieldMetaMap: dataLoadingResult.contextValue.fieldMetaMap,
			allRelationFields: (() => {
				const relations = dataLoadingResult.contextValue.tableMeta?.relations;
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
			})(),
			hasCompletedInitialLoad: !dataLoadingResult.contextValue.isLoading,
		};
	}, [infiniteScroll, infiniteGridData, dataLoadingResult.contextValue]);

	// Get CRUD operations (only available in paginated mode for now)
	const { update, create, delete: deleteRow } = dataLoadingResult.contextValue;

	const relationFieldNames = useMemo(() => new Set(allRelationFields), [allRelationFields]);

	const normalizedServerData = useMemo(() => {
		if (infiniteScroll) return [] as any[]; // Not used in infinite mode
		if (!Array.isArray(serverData) || serverData.length === 0 || relationFieldNames.size === 0) {
			return serverData as any[];
		}
		return (serverData as any[]).map((row) => normalizeServerRow(row, relationFieldNames));
	}, [infiniteScroll, serverData, relationFieldNames]);

	const {
		draftRowsTable,
		draftRows,
		hasDraftRows,
		combinedRows: paginatedCombinedRows,
		draftRowIndices: paginatedDraftRowIndices,
		createDraftRow,
		updateDraftCell,
		removeDraftRow,
		syncDraftRowsWithMeta,
		setDraftRowStatus,
	} = useDraftRows({
		tableKey,
		serverRows: normalizedServerData as any[],
		hasCompletedInitialLoad,
	});

	const serverRowCount = infiniteScroll ? totalCount : normalizedServerData.length;

	const draftDataRows = useMemo(() => {
		if (!draftRows.length) return [] as any[];
		return draftRows.map((draft) => {
			const row = { ...draft.values } as Record<string, unknown>;
			Object.defineProperty(row, '__isDraft', { value: true, enumerable: false, configurable: true });
			Object.defineProperty(row, '__draftRowId', { value: draft.id, enumerable: false, configurable: true });
			Object.defineProperty(row, '__draftStatus', { value: draft.status, enumerable: false, configurable: true });
			Object.defineProperty(row, '__draftErrors', { value: draft.errors, enumerable: false, configurable: true });
			return row;
		});
	}, [draftRows]);

	// ============== INFINITE SCROLL: Virtual rows array ==============
	// Create a proxy array for infinite scroll mode that uses getRowAtIndex and appends draft rows.
	const infiniteRowsProxy = useMemo(() => {
		if (!infiniteScroll) return [] as any[];

		// Create an array-like object with a Proxy to intercept index access
		const handler: ProxyHandler<any[]> = {
			get(target, prop) {
				// Handle array methods and properties
				if (prop === 'length') {
					return serverRowCount + draftDataRows.length;
				}
				if (prop === Symbol.iterator) {
					return function* () {
						const len = serverRowCount + draftDataRows.length;
						for (let i = 0; i < len; i++) {
							if (i < serverRowCount) {
								yield infiniteGridData.getRowAtIndex(i);
							} else {
								yield draftDataRows[i - serverRowCount];
							}
						}
					};
				}
				// Handle numeric indices
				if (typeof prop === 'string' && !isNaN(Number(prop))) {
					const index = Number(prop);
					if (index < serverRowCount) {
						return infiniteGridData.getRowAtIndex(index);
					}
					return draftDataRows[index - serverRowCount];
				}
				// Delegate to target for other properties
				return Reflect.get(target, prop);
			},
		};

		return new Proxy([] as any[], handler);
	}, [infiniteScroll, infiniteGridData, serverRowCount, draftDataRows]);

	// Choose the appropriate rows array based on mode
	const combinedRows = infiniteScroll ? infiniteRowsProxy : paginatedCombinedRows;

	const draftRowIndices = useMemo(() => {
		if (!draftDataRows.length) return [] as number[];
		if (infiniteScroll) {
			return draftDataRows.map((_, index) => serverRowCount + index);
		}
		return paginatedDraftRowIndices;
	}, [draftDataRows, infiniteScroll, paginatedDraftRowIndices, serverRowCount]);

	const fieldMetaByKey = useMemo(() => mapFromFieldMetaMap(fieldMetaMap), [fieldMetaMap]);

	// Build columns with actual data
	// In infinite scroll mode, check if we have initial data
	const hasServerRows = infiniteScroll ? infiniteGridData.hasInitialData : normalizedServerData.length > 0;

	const { columns: baseColumns, columnKeys } = useDataGridColumns(
		tableName,
		hasServerRows ? (combinedRows as any[]) : undefined,
	);

	const gridColumnKeys = useMemo(() => {
		if (!hasDraftRows) return columnKeys;
		return [...columnKeys, DRAFT_ACTION_COLUMN_KEY];
	}, [columnKeys, hasDraftRows]);

	// Pagination helpers
	const totalPages = Math.max(1, Math.ceil((totalCount || 0) / pageSize));
	useEffect(() => {
		gridActions.resetPageIfNeeded(totalPages);
	}, [totalPages, gridActions]);

	// Default-enable all relations per table view.
	// Consolidated into single effect to avoid double state updates that trigger cache clears.
	const initializedTableKeyRef = useRef<string | null>(null);
	useEffect(() => {
		// Skip if already initialized for this table
		if (initializedTableKeyRef.current === tableKey) return;

		// Wait for metadata to be available before initializing
		if (!tableMeta) return;

		// Initialize with all relation fields (single state update)
		initializedTableKeyRef.current = tableKey;
		setEnabledRelations(allRelationFields);
	}, [tableKey, tableMeta, allRelationFields, setEnabledRelations]);

	// Apply custom widths and sort indicators to columns
	const columns = useMemo(() => {
		const sortedColId = gridState.sorting.id;
		const isDesc = gridState.sorting.desc;

		const mapped = baseColumns.map((col) => {
			const isSorted = col.id === sortedColId;
			// Append sort indicator to title if this column is sorted
			const sortIndicator = isSorted ? (isDesc ? ' ↓' : ' ↑') : '';
			return {
				...col,
				title: col.title + sortIndicator,
				width: gridState.columnWidths.get(col.id || '') ?? (col as any).width,
			};
		});

		if (hasDraftRows) {
			mapped.push({
				id: DRAFT_ACTION_COLUMN_KEY,
				title: '',
				width: gridState.columnWidths.get(DRAFT_ACTION_COLUMN_KEY) ?? 132,
			});
		}

		return mapped;
	}, [baseColumns, gridState.columnWidths, gridState.sorting, hasDraftRows]);

	const dataGridRef = useRef<DataEditorRef | null>(null);

	const columnCount = columns.length;

	const draftHighlightRegions = useMemo<Highlight[]>(() => {
		if (!draftRowIndices.length || columnCount === 0) return [];
		const highlightColor = 'rgba(254, 240, 138, 0.45)'; // Tailwind yellow-200 @ ~45% opacity
		return draftRowIndices.map((rowIndex) => ({
			color: highlightColor,
			range: { x: 0, y: rowIndex, width: columnCount, height: 1 },
		}));
	}, [draftRowIndices, columnCount]);

	// Column resize handler using centralized state
	const onColumnResize = useMemo(() => createColumnResizeHandler(gridActions.resizeColumn), [gridActions]);

	// Handle row selection
	useEffect(() => {
		if (!onRowSelect || !gridState.gridSelection) return;
		const selectedIndices = gridState.gridSelection.rows.toArray();
		const selected = selectedIndices.map((i: number) => (combinedRows as any[])[i]).filter(Boolean);
		onRowSelect(selected);
	}, [gridState.gridSelection, combinedRows, onRowSelect]);

	// Initialize specialized hooks for grid functionality
	const { getCellContent: baseGetCellContent, relationInfoByField } = useGridContent(
		combinedRows as any[],
		gridColumnKeys,
		fieldMetaMap,
		createGeometryCell,
		tableName,
		{
			relationChipLimit,
			relationLabelMaxLength,
		},
	);

	const relationInfoObject = useMemo(() => mapFromRelationInfoMap(relationInfoByField), [relationInfoByField]);

	const effectiveColumnOrder = useMemo(() => {
		if (columnKeys.length > 0) return columnKeys;
		return Object.keys(fieldMetaByKey);
	}, [columnKeys, fieldMetaByKey]);

	const metaSignature = useMemo(
		() => computeDraftMetaSignature(effectiveColumnOrder, fieldMetaByKey, relationInfoObject),
		[effectiveColumnOrder, fieldMetaByKey, relationInfoObject],
	);

	const relationInfoRecord = relationInfoObject;

	const allowedColumns = useMemo(() => {
		const tableFields = tableMeta?.fields as { name: string }[] | undefined;
		return tableFields ? new Set(tableFields.map((field) => field.name).filter(Boolean) as string[]) : undefined;
	}, [tableMeta?.fields]);

	useEffect(() => {
		if (!effectiveColumnOrder.length) return;
		syncDraftRowsWithMeta({
			tableKey,
			columnOrder: effectiveColumnOrder,
			fieldMetaByKey,
			relationInfoByKey: relationInfoObject,
			metaVersion: metaSignature,
		});
	}, [effectiveColumnOrder, fieldMetaByKey, relationInfoObject, metaSignature, syncDraftRowsWithMeta, tableKey]);

	/**
	 * Unified optimistic update handler for overlay editors (infinite scroll mode).
	 * Editors that handle mutations internally (RelationEditor, ImageEditor, etc.)
	 * call this callback with a patch to update the grid cache without full refetch.
	 */
	const handleEditorSaveComplete = useCallback(
		(colKey: string, rowIndex: number, patch: Record<string, unknown>) => {
			if (!infiniteScroll) return;

			// Apply optimistic update to infinite scroll cache
			infiniteGridData.updateRowAtIndex(rowIndex, patch);

			// Surgical re-render: tell grid to re-render only affected cell(s)
			if (dataGridRef.current) {
				const cellsToUpdate: { cell: Item }[] = [];

				// Add all patched columns that are visible in the grid
				for (const patchedKey of Object.keys(patch)) {
					const colIndex = gridColumnKeys.indexOf(patchedKey);
					if (colIndex >= 0) {
						cellsToUpdate.push({ cell: [colIndex, rowIndex] });
					}
				}

				// Always include the primary column being edited
				const primaryColIndex = gridColumnKeys.indexOf(colKey);
				if (primaryColIndex >= 0 && !cellsToUpdate.some((c) => c.cell[0] === primaryColIndex)) {
					cellsToUpdate.push({ cell: [primaryColIndex, rowIndex] });
				}

				if (cellsToUpdate.length > 0) {
					dataGridRef.current.updateCells(cellsToUpdate);
				}
			}
		},
		[infiniteScroll, infiniteGridData, gridColumnKeys],
	);

	// Ref to hold submitDraftRowForEditor - populated after useDraftSubmission
	// This breaks the circular dependency: useGridEditors needs the function, but useDraftSubmission
	// needs hasDraftSelection which comes from useGridSelectionState which needs combinedRows
	const submitDraftRowForEditorRef = useRef<((draftRowId: string) => Promise<DraftSubmitResult>) | null>(null);

	const handleSubmitDraftRowForEditor = useCallback(
		async (draftRowId: string): Promise<DraftSubmitResult> => {
			if (!submitDraftRowForEditorRef.current) {
				return { createdRow: null };
			}
			return submitDraftRowForEditorRef.current(draftRowId);
		},
		[],
	);

	const { onCellActivated: baseOnCellActivated, provideEditor: baseProvideEditor } = useGridEditors(
		gridColumnKeys,
		fieldMetaMap,
		combinedRows as any[],
		tableName,
		relationInfoByField,
		// In infinite scroll mode, trigger optimistic cache update when overlay editors save
		infiniteScroll ? handleEditorSaveComplete : undefined,
		// Callback for editors that need to submit a draft row and get the created row
		handleSubmitDraftRowForEditor,
		// Callback to invalidate data after draft+upload workflows complete
		infiniteScroll ? infiniteGridData.invalidate : undefined,
	);
	// Memoize feedback callbacks for grid operations
	const operationFeedback = useMemo(
		() => ({
			onStart: startOperation,
			onProgress: updateOperationProgress,
			onComplete: completeOperation,
		}),
		[startOperation, updateOperationProgress, completeOperation],
	);

	const gridOpsOptions = useMemo(
		() => ({
			onRemoveDraftRow: (draftRowId: string) => removeDraftRow(tableKey, draftRowId),
			feedback: operationFeedback,
		}),
		[removeDraftRow, tableKey, operationFeedback],
	);

	const { deleteSelected } = useGridOperations(
		combinedRows as any[],
		deleteRow,
		gridState.gridSelection,
		() => gridActions.setGridSelection(undefined),
		{
			...gridOpsOptions,
			onAfterServerDeletes: infiniteScroll ? infiniteGridData.invalidate : undefined,
		},
	);

	const editCell = useCellEditing({
		gridColumnKeys,
		combinedRows: combinedRows as any[],
		fieldMetaMap,
		relationInfoByField,
		updateDraftCell,
		tableKey,
		update,
		onCellEdit,
	});

	// Cell editing - show toast only for errors
	// Handles both draft rows (local state) and server rows (GraphQL mutation)
	// Uses server response to update cache and triggers surgical grid re-render
	const onCellEdited = useCallback(
		async (cell: Item, newValue: GridCell) => {
			try {
				const [, rowIndex] = cell;
				const result = await editCell(cell, newValue);

				// Server row edit: update cache with server response
				// Note: editCell returns 'draft' for draft rows, so this only runs for server rows
				if (result.type === 'server') {
					if (infiniteScroll) {
						// Infinite scroll mode: update the React Query cache
						if (result.updatedRow) {
							infiniteGridData.updateRowAtIndex(rowIndex, result.updatedRow);
						} else if (result.patchField && result.patchValue !== undefined) {
							// Fallback to patch if server didn't return full row
							infiniteGridData.updateRowAtIndex(rowIndex, { [result.patchField]: result.patchValue });
						}
					}
					// Paginated mode: handled by React Query invalidation in use-table.ts

					// Surgical re-render: Tell grid to re-render only the affected cell
					dataGridRef.current?.updateCells([{ cell }]);
				}
			} catch (e) {
				const description = e instanceof Error ? e.message : 'Failed to update cell';
				toast.error({
					message: 'Update failed',
					description,
				});
				console.error('Cell edit error:', e);
			}
		},
		[editCell, infiniteScroll, infiniteGridData],
	);

	const handleRowAppended = useCallback(async () => {
		if (draftRows.length > 0) {
			return serverRowCount + draftRows.length - 1;
		}

		// Silently skip if metadata isn't ready - this is a transient state
		if (!effectiveColumnOrder.length) return undefined;

		createDraftRow({
			tableKey,
			columnOrder: effectiveColumnOrder,
			fieldMetaByKey: fieldMetaByKey as Record<string, any>,
			relationInfoByKey: relationInfoObject,
			metaVersion: metaSignature,
		});

		return serverRowCount + draftRows.length;
	}, [
		createDraftRow,
		effectiveColumnOrder,
		fieldMetaByKey,
		relationInfoObject,
		metaSignature,
		tableKey,
		draftRows,
		serverRowCount,
	]);

	const { selectedRowCount, selectedDraftRowEntries, hasDraftSelection } = useGridSelectionState({
		gridSelection: gridState.gridSelection,
		combinedRows: combinedRows as any[],
		draftRowsTable,
	});

	const {
		isSubmittingDrafts,
		submitDraftButtonDisabled,
		submitDraftLabel,
		handleSubmitDraftRows,
		handleSubmitSingleDraftRow,
		submitDraftRowForEditor,
	} = useDraftSubmission({
		tableKey,
		draftRowsTable,
		selectedDraftRowEntries,
		hasDraftSelection,
		create,
		removeDraftRow,
		setDraftRowStatus,
		clearSelection: () => gridActions.setGridSelection(undefined),
		allowedColumns,
		relationInfoByKey: relationInfoRecord,
		onSubmittedSuccessfully: infiniteScroll ? infiniteGridData.invalidate : undefined,
		feedback: operationFeedback,
	});

	// Populate the ref for editor access (breaks circular dependency)
	submitDraftRowForEditorRef.current = submitDraftRowForEditor;

	// Compute sortable columns (exclude relation fields - only simple data types are sortable)
	const sortableColumns = useMemo(() => {
		return new Set(gridColumnKeys.filter((key) => !relationFieldNames.has(key)));
	}, [gridColumnKeys, relationFieldNames]);

	// Header click handler for sorting (only allows sorting on non-relation columns)
	const baseHeaderClicked = useMemo(
		() => createHeaderClickHandler(gridColumnKeys, gridActions.toggleSorting, sortableColumns),
		[gridColumnKeys, gridActions.toggleSorting, sortableColumns],
	);

	const {
		getCellContent: paginatedGetCellContent,
		onCellActivated,
		provideEditor,
		onHeaderClicked,
		onCellClicked,
	} = useDraftActionColumn({
		gridColumnKeys,
		combinedRows: combinedRows as any[],
		baseGetCellContent,
		baseOnCellActivated,
		baseProvideEditor,
		baseHeaderClicked,
		handleSubmitSingleDraftRow,
	});

	// ============== INFINITE SCROLL: getCellContent wrapper ==============
	// In infinite scroll mode, we need to handle loading states for server rows not yet fetched.
	const infiniteGetCellContent = useCallback(
		([col, row]: Item): GridCell => {
			if (row < serverRowCount) {
				const rowData = infiniteGridData.getRowAtIndex(row);
				if (rowData === null) {
					return {
						kind: GridCellKind.Loading,
						allowOverlay: false,
					};
				}
			}

			// Row is loaded - delegate to the normal cell content logic
			// We need to manually construct the cell here since combinedRows isn't used in infinite mode
			const colKey = gridColumnKeys[col];
			if (!colKey) {
				return { kind: GridCellKind.Text, data: '', displayData: '', allowOverlay: false };
			}

			// Use the normal getCellContent logic (combinedRows proxy handles server+draft rows).
			return paginatedGetCellContent([col, row]);
		},
		[infiniteGridData, gridColumnKeys, paginatedGetCellContent, serverRowCount],
	);

	// Choose the appropriate getCellContent based on mode
	const getCellContent = infiniteScroll ? infiniteGetCellContent : paginatedGetCellContent;

	// ============== INFINITE SCROLL: onVisibleRegionChanged handler ==============
	const handleVisibleRegionChanged = useCallback(
		(range: Rectangle) => {
			if (!infiniteScroll) return;
			if (serverRowCount <= 0) return;

			const start = Math.max(0, Math.min(range.y, serverRowCount - 1));
			const end = Math.max(start, Math.min(range.y + range.height, serverRowCount));
			infiniteGridData.onVisibleRegionChanged({ ...range, y: start, height: end - start });
		},
		[infiniteScroll, infiniteGridData, serverRowCount],
	);

	// Wrap setters to match control props typing
	const setFiltersForControls = useCallback(
		(
			updater:
				| { id: string; value: string | number | boolean | null | undefined }[]
				| ((prev: { id: string; value: string | number | boolean | null | undefined }[]) => {
						id: string;
						value: string | number | boolean | null | undefined;
				  }[]),
		) => {
			const next = typeof updater === 'function' ? updater(gridState.filters as any) : updater;
			gridActions.setFilters(next as any);
		},
		[gridActions, gridState.filters],
	);

	const setGridSelectionForControls = useCallback(
		(selection: GridSelection | null) => {
			gridActions.setGridSelection(selection ?? undefined);
		},
		[gridActions],
	);

	// Filter management actions
	const addFilter = useCallback(() => {
		const firstCol = columnKeys.find((k) => k !== 'select');
		if (firstCol) {
			gridActions.addFilter(firstCol);
		}
	}, [columnKeys, gridActions]);

	const applyFilters = useCallback(() => {
		gridActions.setFiltersOpen(false);
	}, [gridActions]);

	// Compute frozen columns: id column if present
	const frozenCount = useMemo(() => {
		const idFrozen = columnKeys[0] === 'id' ? 1 : 0;
		return idFrozen; // Row markers are separate
	}, [columnKeys]);

	// Draw cell callback for relation count badges
	const drawCell = useMemo(
		() => createDrawCellCallback(gridColumnKeys, relationInfoByField),
		[gridColumnKeys, relationInfoByField],
	);

	const lastInvalidateSignatureRef = useRef<string>('');
	useEffect(() => {
		const signature = `${fieldMetaMap.size}:${relationInfoByField.size}:${gridColumnKeys.length}:${draftRowIndices.join(',')}`;
		if (signature === lastInvalidateSignatureRef.current) return;
		lastInvalidateSignatureRef.current = signature;

		if (fieldMetaMap.size === 0) return;
		if (draftRowIndices.length === 0) return;
		if (!dataGridRef.current) return;

		const cells: { cell: Item }[] = [];
		for (const row of draftRowIndices) {
			for (let col = 0; col < gridColumnKeys.length; col += 1) {
				cells.push({ cell: [col, row] });
			}
		}
		dataGridRef.current.updateCells(cells);
	}, [draftRowIndices, fieldMetaMap.size, gridColumnKeys.length, relationInfoByField.size]);

	return (
		<ClientOnly
			fallback={
				<div className='bg-background relative flex h-full min-h-0 flex-1 items-center justify-center rounded-lg border'>
					<div className='text-muted-foreground'>Loading...</div>
				</div>
			}
		>
			{/* Controls */}
			<div data-part-id='data-grid-v2-controls-container' ref={controlsRef}>
				<DataGridV2Controls
					openSearch={() => setShowSearch(true)}
					filters={gridState.filters}
					setFilters={setFiltersForControls}
					filtersOpen={gridState.filtersOpen}
					setFiltersOpen={gridActions.setFiltersOpen}
					addFilter={addFilter}
					clearAllFilters={gridActions.clearAllFilters}
					applyFilters={applyFilters}
					columnKeys={columnKeys}
					showSelection={showSelection}
					gridSelection={gridState.gridSelection ?? null}
					setGridSelection={setGridSelectionForControls}
					deleteSelected={deleteSelected}
					tableName={tableName}
					enabledRelations={gridState.enabledRelations}
					setEnabledRelations={gridActions.setEnabledRelations}
				/>
			</div>

			{/* Grid */}
			<div
				data-part-id='data-grid-v2-container'
				ref={containerRef}
				className={cn('bg-background relative isolate h-full min-h-0 flex-1 overflow-hidden rounded-lg border', className)}
			>
				<DataEditor
					ref={dataGridRef}
					theme={themeOverrides}
					rowMarkerTheme={rowMarkerTheme}
					width={bounds.width}
					height={bounds.height}
					columns={columns}
					rows={(combinedRows as any[]).length}
					cellActivationBehavior='double-click'
					// Use Glide's built-in search UI
					showSearch={showSearch}
					onSearchClose={() => {
						setShowSearch(false);
						setSearchValue('');
					}}
					searchValue={searchValue}
					onSearchValueChange={setSearchValue}
					getCellsForSelection={infiniteScroll ? undefined : true} // Disable in infinite mode (would need all data)
					// Enable multi-range and multi-row selection for bulk actions
					rangeSelect='multi-rect'
					rowSelect='multi'
					rowSelectionMode='multi'
					getCellContent={getCellContent}
					onCellEdited={onCellEdited}
					onCellActivated={onCellActivated}
					trailingRowOptions={{ hint: 'New row', sticky: true }}
					onRowAppended={handleRowAppended}
					rowMarkers={showSelection ? 'both' : 'none'}
					// In infinite scroll mode, row markers start at 1; in paginated mode, offset by page
					rowMarkerStartIndex={infiniteScroll ? 1 : gridState.pageIndex * pageSize + 1}
					gridSelection={gridState.gridSelection}
					onGridSelectionChange={gridActions.setGridSelection}
					onHeaderClicked={onHeaderClicked}
					onColumnResize={onColumnResize}
					// Infinite scroll handler
					onVisibleRegionChanged={infiniteScroll ? handleVisibleRegionChanged : undefined}
					overscrollX={200}
					// Add vertical overscroll in infinite mode for smoother scrolling
					overscrollY={infiniteScroll ? 100 : undefined}
					maxColumnAutoWidth={500}
					maxColumnWidth={2000}
					freezeColumns={frozenCount}
					scaleToRem={true}
					smoothScrollX={true}
					smoothScrollY={true}
					customRenderers={allCustomCells}
					provideEditor={provideEditor}
					onCellClicked={onCellClicked}
					highlightRegions={draftHighlightRegions}
					drawCell={drawCell}
				/>

				{/* Floating action dock - shows when rows are selected */}
				<AnimatePresence>
					{showSelection && selectedRowCount > 0 && (
						<motion.div
							key='grid-action-dock'
							className='pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2'
							{...variants.floatUp}
							transition={springs.bouncy}
						>
							{/* Disable magnification by setting equal sizes and using a non-DockIcon child */}
							<Dock iconSize={40} iconMagnification={40}>
								<Button
									variant='default'
									size='sm'
									className='pointer-events-auto h-10 rounded-2xl px-4 shadow-md'
									onClick={handleSubmitDraftRows}
									disabled={submitDraftButtonDisabled}
									aria-label={
										submitDraftButtonDisabled ? 'Submit draft rows (select draft rows to enable)' : submitDraftLabel
									}
									title={submitDraftButtonDisabled ? 'Select draft rows to submit' : submitDraftLabel}
								>
									{isSubmittingDrafts ? (
										<RiLoader4Line className='h-5 w-5 animate-spin' />
									) : (
										<RiSendPlaneLine className='h-5 w-5' />
									)}
									<span className='ms-2'>{isSubmittingDrafts ? 'Submitting...' : submitDraftLabel}</span>
								</Button>
								<Button
									variant='destructive'
									size='sm'
									className='pointer-events-auto h-10 rounded-2xl px-4 shadow-md'
									onClick={deleteSelected}
									aria-label={`Delete ${selectedRowCount} ${selectedRowCount === 1 ? 'row' : 'rows'}`}
									title={`Delete ${selectedRowCount} ${selectedRowCount === 1 ? 'row' : 'rows'}`}
								>
									<RiDeleteBin6Line className='h-5 w-5' />
									<span className='ms-2'>
										Delete {selectedRowCount} {selectedRowCount === 1 ? 'row' : 'rows'}
									</span>
								</Button>
							</Dock>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Floating status indicator - shows independently for operation feedback */}
				<div className='pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2'>
					<FloatingStatus />
				</div>
			</div>

			{/* Pagination - hidden in infinite scroll mode */}
			{showPagination && !infiniteScroll && totalPages > 1 && (
				<div ref={paginationRef}>
					<DataGridV2Pagination
						pageIndex={gridState.pageIndex}
						pageSize={pageSize}
						totalCount={totalCount}
						totalPages={totalPages}
						setPageIndex={(v) => gridActions.setPageIndex(typeof v === 'function' ? v(gridState.pageIndex) : v)}
					/>
				</div>
			)}
		</ClientOnly>
	);
}

export type { DataGridProps as DataGridV2Props } from '@/components/dashboard/data-grid/data-grid.types';
