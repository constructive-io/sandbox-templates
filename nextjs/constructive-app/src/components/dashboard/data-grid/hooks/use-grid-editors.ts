import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { GridCell, Item, ProvideEditorCallback } from '@glideapps/glide-data-grid';
import { GridCellKind } from '@glideapps/glide-data-grid';

import { useMeta } from '@/lib/gql/hooks/dashboard/use-dashboard-meta-query';
import { useAppStore, useShallow } from '@/store/app-store';
import type { RelationInfo } from '@/store/data-grid-slice';

import { resolveCellType, shouldShowCellActivation } from '../cell-type-resolver';
import { handleCellActivation } from '../data-grid.utils';
import { createEditor, type DraftSubmitResult, type EditorFactoryProps } from '../editor-registry';

const EMPTY_RELATION_INFO_BY_FIELD = new Map<string, RelationInfo>();

export function useGridEditors(
	columnKeys: string[],
	fieldMetaMap: Map<string, any>,
	data: any[],
	tableName: string,
	relationInfoByField?: Map<string, RelationInfo>,
	/**
	 * Unified callback for overlay editors to trigger optimistic cache updates.
	 * Editors that handle mutations internally (RelationEditor, ImageEditor, etc.)
	 * call this to update the grid cache without full refetch.
	 */
	onEditorSaveComplete?: (colKey: string, rowIndex: number, patch: Record<string, unknown>) => void,
	/**
	 * Callback to submit a single draft row and get the created row.
	 * Used by editors that need to perform mutations (like ImageEditor upload)
	 * which require a persisted row ID.
	 */
	onSubmitDraftRow?: (draftRowId: string) => Promise<DraftSubmitResult>,
	/**
	 * Callback to invalidate/refresh grid data.
	 * Used after draft row + upload workflows complete.
	 */
	onInvalidateData?: () => void,
) {
	const activeCellRef = useRef<Item | null>(null);
	const { data: meta } = useMeta();
	const { ensureRelationInfo, relationInfoByFieldFromStore } = useAppStore(
		useShallow((s) => ({
			ensureRelationInfo: s.ensureRelationInfo,
			relationInfoByFieldFromStore: tableName ? s.relationInfoMapCache[tableName] : undefined,
		})),
	);

	const effectiveRelationInfoByField = relationInfoByField ?? relationInfoByFieldFromStore ?? EMPTY_RELATION_INFO_BY_FIELD;
	const relationFieldNamesFromMeta = useMemo(() => {
		if (!tableName) return new Set<string>();
		const table = meta?._meta?.tables?.find((t: any) => t?.name === tableName);
		if (!table?.relations) return new Set<string>();

		const out = new Set<string>();
		const rels = table.relations;

		(rels.belongsTo ?? []).forEach((r: any) => {
			if (r?.fieldName) out.add(r.fieldName);
			(r?.keys ?? []).forEach((k: any) => {
				if (k?.name) out.add(k.name);
			});
		});
		(rels.hasOne ?? []).forEach((r: any) => {
			if (r?.fieldName) out.add(r.fieldName);
		});
		(rels.hasMany ?? []).forEach((r: any) => {
			if (r?.fieldName) out.add(r.fieldName);
		});
		(rels.manyToMany ?? []).forEach((r: any) => {
			if (r?.fieldName) out.add(r.fieldName);
		});

		return out;
	}, [meta, tableName]);

	// Build a quick lookup of relation fields for the current table using global cache
	useEffect(() => {
		if (!tableName || effectiveRelationInfoByField.size) return;
		ensureRelationInfo(tableName, meta);
	}, [tableName, effectiveRelationInfoByField.size, ensureRelationInfo, meta]);

	const onCellActivated = useCallback(
		(cell: Item) => {
			const [colIndex, rowIndex] = cell;
			const colKey = columnKeys[colIndex];
			if (!colKey) return;

			const rowData = data?.[rowIndex];
			if (rowData?.__isDraft && colKey === 'id') {
				return;
			}

			// Track the last activated cell for editor resolution even when activation UI is suppressed
			activeCellRef.current = cell;

			const fieldMeta = fieldMetaMap.get(colKey);
			const resolution = resolveCellType(colKey, fieldMeta);

			if (!shouldShowCellActivation(colKey, resolution.cellType)) {
				return;
			}
			handleCellActivation(cell, columnKeys);
		},
		[columnKeys, data, fieldMetaMap],
	);

	const provideEditor: ProvideEditorCallback<GridCell> = useCallback(
		(cell: GridCell) => {
			const cellWithLocation = cell as GridCell & { location?: [number, number] };
			let colKey: string | undefined;
			let rowIndex: number | undefined;

			// Try to resolve column from cell location; fallback to last activated cell
			if (cellWithLocation.location && Array.isArray(cellWithLocation.location)) {
				const [colIndex, row] = cellWithLocation.location;
				colKey = columnKeys[colIndex];
				rowIndex = row;
			} else if (activeCellRef.current) {
				const [colIndex, row] = activeCellRef.current;
				colKey = columnKeys[colIndex];
				rowIndex = row;
			}

			if (rowIndex !== undefined) {
				const rowData = data?.[rowIndex];
				if (rowData?.__isDraft && colKey === 'id') {
					return undefined;
				}
			}

			// Get field metadata and resolve cell type
			const fieldMeta = fieldMetaMap.get(colKey || '');

			// Detect our custom geometry cell regardless of backend meta
			const isCustomGeometry = cell.kind === GridCellKind.Custom && (cell as any)?.data?.kind === 'geometry-cell';


			const relationInfo = colKey ? effectiveRelationInfoByField.get(colKey) : undefined;
			const isRelationColumn = Boolean(relationInfo) || (colKey ? relationFieldNamesFromMeta.has(colKey) : false);

			// Cell type is determined from schema metadata only, not runtime values
			const resolution = resolveCellType(colKey || '', fieldMeta);

			// Block editor for cells that can't be activated (not editable and not viewer-only)
			// Relations get special treatment as they force overlay editors
			if (!resolution.canActivate && !isRelationColumn) {
				return undefined;
			}

			// Determine the proper cell type based on priority:
			// 1. Relation columns (detected via meta)
			// 2. Custom geometry cells (detected from cell structure)
			// 3. Cell type resolved from metadata (uses CellRegistry matching)
			let cellType = resolution.cellType;

			if (isRelationColumn) {
				cellType = 'relation';
			} else if (isCustomGeometry) {
				cellType = 'geometry';
			}
			// Otherwise use resolved cellType from CellRegistry matching

			// Prepare editor factory props
			const editorProps: EditorFactoryProps = {
				cell,
				cellType,
				colKey: colKey || '',
				rowData: {}, // Will be resolved inside editor factories
				tableName,
				activeCellRef,
				data,
				columnKeys,
				fieldMetaMap,
				relationInfoByField: effectiveRelationInfoByField,
				onEditorSaveComplete,
				onSubmitDraftRow,
				onInvalidateData,
			};

			return createEditor(editorProps);
		},
		[columnKeys, data, fieldMetaMap, effectiveRelationInfoByField, relationFieldNamesFromMeta, tableName, onEditorSaveComplete, onSubmitDraftRow, onInvalidateData],
	);

	return {
		onCellActivated,
		provideEditor,
		activeCellRef,
	};
}
