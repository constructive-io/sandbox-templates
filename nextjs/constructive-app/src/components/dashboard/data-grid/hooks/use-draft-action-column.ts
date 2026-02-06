import { useCallback } from 'react';
import type { GridCell, Item } from '@glideapps/glide-data-grid';
import { GridCellKind } from '@glideapps/glide-data-grid';

import type { DraftRow } from '@/store/draft-rows-slice';

import { createDraftActionCell } from '../custom-cells';
import { DRAFT_ACTION_COLUMN_KEY } from '../data-grid.constants';

interface UseDraftActionColumnParams {
	gridColumnKeys: string[];
	combinedRows: any[];
	baseGetCellContent: (cell: Item) => GridCell;
	baseOnCellActivated: (cell: Item) => void;
	baseProvideEditor: (cell: GridCell) => any;
	baseHeaderClicked: (colIndex: number) => void;
	handleSubmitSingleDraftRow: (draftRowId: string) => Promise<void> | void;
}

export function useDraftActionColumn({
	gridColumnKeys,
	combinedRows,
	baseGetCellContent,
	baseOnCellActivated,
	baseProvideEditor,
	baseHeaderClicked,
	handleSubmitSingleDraftRow,
}: UseDraftActionColumnParams) {
	const getCellContent = useCallback(
		(cell: Item): GridCell => {
			const [colIndex, rowIndex] = cell;
			const columnKey = gridColumnKeys[colIndex];
			if (columnKey === DRAFT_ACTION_COLUMN_KEY) {
				const rowData = combinedRows[rowIndex];
				if (!rowData?.__isDraft) {
					return {
						kind: GridCellKind.Text,
						allowOverlay: false,
						data: '',
						displayData: '',
					};
				}

				const status = (rowData.__draftStatus as DraftRow['status'] | undefined) ?? 'idle';
				const hasErrors = Boolean(rowData.__draftErrors);
				const isMissingId = !rowData.__draftRowId;

				return createDraftActionCell({
					status,
					disabled: isMissingId || status === 'saving',
					errored: hasErrors,
				});
			}

			return baseGetCellContent(cell);
		},
		[baseGetCellContent, combinedRows, gridColumnKeys],
	);

	const onCellActivated = useCallback(
		(cell: Item) => {
			if (gridColumnKeys[cell[0]] === DRAFT_ACTION_COLUMN_KEY) return;
			baseOnCellActivated(cell);
		},
		[baseOnCellActivated, gridColumnKeys],
	);

	const provideEditor = useCallback(
		(cell: GridCell) => {
			const cellWithLocation = cell as GridCell & { location?: [number, number] };
			const location = cellWithLocation.location;
			if (location) {
				const columnKey = gridColumnKeys[location[0]];
				if (columnKey === DRAFT_ACTION_COLUMN_KEY) {
					return undefined;
				}
			}
			return baseProvideEditor(cell);
		},
		[baseProvideEditor, gridColumnKeys],
	);

	const onHeaderClicked = useCallback(
		(colIndex: number) => {
			if (gridColumnKeys[colIndex] === DRAFT_ACTION_COLUMN_KEY) return;
			baseHeaderClicked(colIndex);
		},
		[baseHeaderClicked, gridColumnKeys],
	);

	const onCellClicked = useCallback(
		(cell: Item) => {
			const [colIndex, rowIndex] = cell;
			if (gridColumnKeys[colIndex] !== DRAFT_ACTION_COLUMN_KEY) return;

			const rowData = combinedRows[rowIndex];
			if (!rowData?.__isDraft) return;

			const draftRowId = rowData.__draftRowId as string | undefined;
			const draftStatus = (rowData.__draftStatus as DraftRow['status'] | undefined) ?? 'idle';
			if (!draftRowId || draftStatus === 'saving') return;

			void handleSubmitSingleDraftRow(draftRowId);
		},
		[combinedRows, gridColumnKeys, handleSubmitSingleDraftRow],
	);

	return {
		getCellContent,
		onCellActivated,
		provideEditor,
		onHeaderClicked,
		onCellClicked,
	};
}
