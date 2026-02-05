import { useCallback } from 'react';
import type { GridSelection } from '@glideapps/glide-data-grid';

interface OperationFeedbackCallbacks {
	onStart?: (type: 'delete', total: number) => string;
	onProgress?: (id: string, completed: number, failed: number) => void;
	onComplete?: (id: string, status: 'success' | 'partial' | 'error', message: string) => void;
}

export function useGridOperations(
	data: any[],
	deleteRow: (id: string | number) => Promise<any>,
	gridSelection: GridSelection | undefined,
	clearSelection: () => void,
	options?: {
		onRemoveDraftRow?: (draftRowId: string) => void;
		onAfterServerDeletes?: () => void;
		feedback?: OperationFeedbackCallbacks;
	},
) {
	const deleteSelected = useCallback(async () => {
		if (!gridSelection) return;

		const rows = gridSelection.rows.toArray();
		if (rows.length === 0) return;

		// Start operation feedback
		const operationId = options?.feedback?.onStart?.('delete', rows.length);

		let successes = 0;
		let failures = 0;
		let serverSuccesses = 0;

		// Process deletions sequentially for progress tracking
		for (const idx of rows) {
			const record = data[idx];

			if (record?.__isDraft && options?.onRemoveDraftRow) {
				const draftRowId = record.__draftRowId as string | undefined;
				if (draftRowId) {
					options.onRemoveDraftRow(draftRowId);
					successes += 1;
				} else {
					failures += 1;
				}
			} else if (record?.id) {
				try {
					await deleteRow(record.id);
					successes += 1;
					serverSuccesses += 1;
				} catch (error) {
					console.error(`Failed to delete record ${record.id}:`, error);
					failures += 1;
				}
			} else {
				failures += 1;
			}

			// Update progress
			if (operationId) {
				options?.feedback?.onProgress?.(operationId, successes, failures);
			}
		}

		// Complete operation feedback
		if (operationId) {
			if (failures === 0 && successes > 0) {
				options?.feedback?.onComplete?.(
					operationId,
					'success',
					`Deleted ${successes} ${successes === 1 ? 'row' : 'rows'}`,
				);
			} else if (successes > 0 && failures > 0) {
				options?.feedback?.onComplete?.(
					operationId,
					'partial',
					`Deleted ${successes}, ${failures} failed`,
				);
			} else if (failures > 0) {
				options?.feedback?.onComplete?.(
					operationId,
					'error',
					`Failed to delete ${failures} ${failures === 1 ? 'row' : 'rows'}`,
				);
			}
		}

		if (serverSuccesses > 0) {
			options?.onAfterServerDeletes?.();
		}

		// Always clear selection so indices don't point to new rows after deletion
		clearSelection();
	}, [gridSelection, data, deleteRow, clearSelection, options]);

	return {
		deleteSelected,
	};
}
