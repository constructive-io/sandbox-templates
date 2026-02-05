import { useMemo } from 'react';
import type { GridSelection } from '@glideapps/glide-data-grid';

import type { DraftRow } from '@/store/draft-rows-slice';

interface DraftRowsTableState {
	order: string[];
	map: Record<string, DraftRow>;
	template: Record<string, unknown>;
	metaVersion: string;
	columnOrder: string[];
}

export interface DraftRowEntry {
	draftRowId: string;
	draftRow: DraftRow;
}

interface UseGridSelectionStateParams {
	gridSelection: GridSelection | undefined;
	combinedRows: any[];
	draftRowsTable?: DraftRowsTableState;
}

export function useGridSelectionState({ gridSelection, combinedRows, draftRowsTable }: UseGridSelectionStateParams) {
	const selectedRowIndices = useMemo(() => {
		if (!gridSelection) return [] as number[];
		try {
			return gridSelection.rows.toArray();
		} catch {
			return [] as number[];
		}
	}, [gridSelection]);

	const fallbackSelectedRowCount = useMemo(() => {
		if (!gridSelection) return 0;
		try {
			return gridSelection.rows.toArray().length;
		} catch {
			return gridSelection.rows?.length ?? 0;
		}
	}, [gridSelection]);

	const selectedRowCount = selectedRowIndices.length > 0 ? selectedRowIndices.length : fallbackSelectedRowCount;

	const selectedDraftRowEntries = useMemo(() => {
		if (!draftRowsTable || selectedRowIndices.length === 0) return [] as DraftRowEntry[];

		return selectedRowIndices
			.map((rowIndex) => combinedRows[rowIndex])
			.filter((row): row is { __draftRowId: string } => Boolean(row?.__isDraft && row?.__draftRowId))
			.map(({ __draftRowId }) => {
				const draftRow = draftRowsTable.map[__draftRowId];
				return draftRow ? { draftRowId: __draftRowId, draftRow } : null;
			})
			.filter((entry): entry is DraftRowEntry => entry !== null);
	}, [draftRowsTable, selectedRowIndices, combinedRows]);

	const hasDraftSelection = selectedDraftRowEntries.length > 0;

	return {
		selectedRowIndices,
		selectedRowCount,
		selectedDraftRowEntries,
		hasDraftSelection,
	};
}
