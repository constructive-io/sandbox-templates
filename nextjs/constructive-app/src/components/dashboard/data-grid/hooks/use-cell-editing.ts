import { useCallback } from 'react';
import type { GridCell, Item } from '@glideapps/glide-data-grid';

import { DRAFT_ACTION_COLUMN_KEY } from '../data-grid.constants';
import { extractCellValue, handleCellEdit, prepareDraftRelationValue, type CellEditResult } from '../data-grid.utils';
import type { DraftRowsState } from './use-draft-rows';

/** Result from the useCellEditing hook */
export interface CellEditingResult {
	/** Type of edit: 'draft' for local draft row, 'server' for server mutation, 'noop' for no action */
	type: 'draft' | 'server' | 'noop';
	/** The updated row data from the server (only for 'server' type) */
	updatedRow?: Record<string, unknown> | null;
	/** The field that was patched (only for 'server' type) */
	patchField?: string;
	/** The value that was sent (only for 'server' type) */
	patchValue?: unknown;
}

interface UseCellEditingParams {
	gridColumnKeys: string[];
	combinedRows: any[];
	fieldMetaMap: Map<string, any>;
	relationInfoByField: Map<string, any>;
	updateDraftCell: DraftRowsState['updateDraftCell'];
	tableKey: string;
	update: (id: string | number, data: Record<string, unknown>) => Promise<{ updatedRow?: Record<string, unknown> | null }>;
	onCellEdit?: (id: string | number, field: string, value: unknown) => void;
}

export function useCellEditing({
	gridColumnKeys,
	combinedRows,
	fieldMetaMap,
	relationInfoByField,
	updateDraftCell,
	tableKey,
	update,
	onCellEdit,
}: UseCellEditingParams) {
	return useCallback(
		async (cell: Item, newValue: GridCell): Promise<CellEditingResult> => {
			const [colIndex, rowIndex] = cell;
			const colKey = gridColumnKeys[colIndex];
			const rowData = combinedRows[rowIndex];
			if (!colKey || !rowData) return { type: 'noop' };

			if (colKey === DRAFT_ACTION_COLUMN_KEY) {
				return { type: 'noop' };
			}

			if (rowData.__isDraft && colKey === 'id') {
				return { type: 'noop' };
			}

			if (rowData.__isDraft) {
				const draftRowId: string | undefined = rowData.__draftRowId;
				if (!draftRowId) return { type: 'noop' };

				const fieldMeta = fieldMetaMap.get(colKey);
				const baseValue = extractCellValue(newValue, fieldMeta);
				const relationInfo = relationInfoByField.get(colKey);

				let storedValue: unknown = baseValue;
				let extraValues: Record<string, unknown> | undefined;

				if (relationInfo) {
					const { relationData, foreignKeyUpdates, relationReferences } = prepareDraftRelationValue(
						baseValue,
						relationInfo,
					);
					const relationFieldKey = relationInfo.relationField;
					const foreignKeyFieldKey = relationInfo.foreignKeyField;
					const editingRelationField = relationFieldKey ? relationFieldKey === colKey : false;
					const editingForeignKeyField = foreignKeyFieldKey ? foreignKeyFieldKey === colKey : false;

					const processedRelationData = Array.isArray(relationData)
						? relationData.filter((entry) => entry !== undefined)
						: relationData;

					const relationExtra = relationFieldKey
						? processedRelationData === undefined
							? undefined
							: processedRelationData === null
								? { [relationFieldKey]: null }
								: typeof processedRelationData === 'object'
									? { [relationFieldKey]: processedRelationData }
									: undefined
						: undefined;

					const processedReferenceValue = Array.isArray(relationReferences)
						? relationReferences.filter((entry) => entry !== undefined)
						: relationReferences;

					const foreignKeyExtra = foreignKeyFieldKey
						? processedReferenceValue !== undefined
							? { [foreignKeyFieldKey]: processedReferenceValue }
							: undefined
						: undefined;

					if (editingRelationField) {
						storedValue = processedRelationData;
						extraValues = {
							...(foreignKeyUpdates ?? {}),
						};
					} else if (editingForeignKeyField) {
						storedValue = processedReferenceValue ?? processedRelationData;
						extraValues = {
							...(foreignKeyUpdates ?? {}),
							...(relationExtra ?? {}),
						};
					} else {
						storedValue = processedRelationData;
						extraValues = {
							...(foreignKeyUpdates ?? {}),
							...(relationExtra ?? {}),
							...(foreignKeyExtra ?? {}),
						};
					}
				}

				updateDraftCell({
					tableKey,
					draftRowId,
					columnKey: colKey,
					value: storedValue,
					extraValues: extraValues && Object.keys(extraValues).length > 0 ? extraValues : undefined,
				});
				return { type: 'draft' };
			}

			// Server row edit - returns the updated row from the server
			const result = await handleCellEdit(
				cell,
				newValue,
				combinedRows,
				gridColumnKeys,
				fieldMetaMap,
				update,
				onCellEdit,
				relationInfoByField,
			);

			if (!result.success) {
				return { type: 'noop' };
			}

			return {
				type: 'server',
				updatedRow: result.updatedRow,
				patchField: result.patchField,
				patchValue: result.patchValue,
			};
		},
		[combinedRows, fieldMetaMap, gridColumnKeys, relationInfoByField, tableKey, update, onCellEdit, updateDraftCell],
	);
}
