import { useMemo, useRef } from 'react';

import { useAppStore, useShallow, type AppState } from '@/store/app-store';
import type { DraftRow } from '@/store/draft-rows-slice';

interface DraftRowsTableState {
	order: string[];
	map: Record<string, DraftRow>;
	template: Record<string, unknown>;
	metaVersion: string;
	columnOrder: string[];
}

interface UseDraftRowsParams {
	tableKey: string;
	serverRows: any[];
	hasCompletedInitialLoad: boolean;
}

export interface DraftRowsState {
	draftRowsTable?: DraftRowsTableState;
	draftRows: DraftRow[];
	hasDraftRows: boolean;
	combinedRows: any[];
	draftRowIndices: number[];
	createDraftRow: AppState['createDraftRow'];
	updateDraftCell: AppState['updateDraftCell'];
	removeDraftRow: AppState['removeDraftRow'];
	syncDraftRowsWithMeta: AppState['syncDraftRowsWithMeta'];
	setDraftRowStatus: AppState['setDraftRowStatus'];
}

export function useDraftRows({
	tableKey,
	serverRows,
	hasCompletedInitialLoad,
}: UseDraftRowsParams): DraftRowsState {
	const { draftRowsTable, createDraftRow, updateDraftCell, removeDraftRow, syncDraftRowsWithMeta, setDraftRowStatus } =
		useAppStore(
			useShallow((state) => ({
				draftRowsTable: state.draftRowsByTable[tableKey] as DraftRowsTableState | undefined,
				createDraftRow: state.createDraftRow,
				updateDraftCell: state.updateDraftCell,
				removeDraftRow: state.removeDraftRow,
				syncDraftRowsWithMeta: state.syncDraftRowsWithMeta,
				setDraftRowStatus: state.setDraftRowStatus,
			})),
		);

	const draftRows = useMemo(() => {
		if (!draftRowsTable) return [] as DraftRow[];
		return draftRowsTable.order.map((id) => draftRowsTable.map[id]).filter((row): row is DraftRow => Boolean(row));
	}, [draftRowsTable]);

	const previousCompletedLoadRef = useRef(hasCompletedInitialLoad);
	if (hasCompletedInitialLoad) {
		previousCompletedLoadRef.current = true;
	}

	const hasServerRows = serverRows.length > 0;
	const mayShowDrafts = hasServerRows || draftRows.length > 0;

	const combinedRows = useMemo(() => {
		if (!draftRows.length || !mayShowDrafts) return serverRows as any[];

		const draftDataRows = draftRows.map((draft) => {
			const row = { ...draft.values } as Record<string, unknown>;
			Object.defineProperty(row, '__isDraft', { value: true, enumerable: false, configurable: true });
			Object.defineProperty(row, '__draftRowId', { value: draft.id, enumerable: false, configurable: true });
			Object.defineProperty(row, '__draftStatus', { value: draft.status, enumerable: false, configurable: true });
			Object.defineProperty(row, '__draftErrors', { value: draft.errors, enumerable: false, configurable: true });
			return row;
		});

		return [...(serverRows as any[]), ...draftDataRows];
	}, [serverRows, draftRows, mayShowDrafts]);

	const draftRowIndices = useMemo(() => {
		const indices: number[] = [];
		combinedRows.forEach((row, index) => {
			if (row?.__isDraft) {
				indices.push(index);
			}
		});
		return indices;
	}, [combinedRows]);

	const hasDraftRows = draftRows.length > 0 && mayShowDrafts;

	return {
		draftRowsTable,
		draftRows,
		hasDraftRows,
		combinedRows,
		draftRowIndices,
		createDraftRow,
		updateDraftCell,
		removeDraftRow,
		syncDraftRowsWithMeta,
		setDraftRowStatus,
	};
}
