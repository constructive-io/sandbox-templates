/**
 * @vitest-environment jsdom
 */

import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useDraftSubmission } from '../hooks/use-draft-submission';

let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
	consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
	consoleErrorSpy.mockRestore();
});

function createDraftRowsTable(draftRowId: string) {
	return {
		order: [draftRowId],
		map: {
			[draftRowId]: {
				id: draftRowId,
				values: { id: 'draft:id', name: 'A' },
				status: 'idle' as const,
				errors: null,
				createdAt: Date.now(),
				metaVersion: 'v1',
			},
		},
		template: {},
		metaVersion: 'v1',
		columnOrder: ['id', 'name'],
	};
}

describe('useDraftSubmission refresh callback', () => {
	it('calls onSubmittedSuccessfully when at least one create succeeds', async () => {
		const create = vi.fn().mockResolvedValue({});
		const removeDraftRow = vi.fn();
		const setDraftRowStatus = vi.fn();
		const clearSelection = vi.fn();
		const onSubmittedSuccessfully = vi.fn();

		const draftRowId = 'draft:1';
		const draftRowsTable = createDraftRowsTable(draftRowId);

		const { result } = renderHook(() =>
			useDraftSubmission({
				tableKey: 'dashboard::db::users',
				draftRowsTable,
				selectedDraftRowEntries: [{ draftRowId, draftRow: draftRowsTable.map[draftRowId] }],
				hasDraftSelection: true,
				create,
				removeDraftRow,
				setDraftRowStatus,
				clearSelection,
				onSubmittedSuccessfully,
			}),
		);

		await act(async () => {
			await result.current.handleSubmitDraftRows();
		});

		expect(create).toHaveBeenCalledTimes(1);
		expect(removeDraftRow).toHaveBeenCalledTimes(1);
		expect(onSubmittedSuccessfully).toHaveBeenCalledTimes(1);
		expect(onSubmittedSuccessfully).toHaveBeenCalledWith({ success: 1, failed: 0 });
	});

	it('does not call onSubmittedSuccessfully when all creates fail', async () => {
		const create = vi.fn().mockRejectedValue(new Error('nope'));
		const removeDraftRow = vi.fn();
		const setDraftRowStatus = vi.fn();
		const clearSelection = vi.fn();
		const onSubmittedSuccessfully = vi.fn();

		const draftRowId = 'draft:1';
		const draftRowsTable = createDraftRowsTable(draftRowId);

		const { result } = renderHook(() =>
			useDraftSubmission({
				tableKey: 'dashboard::db::users',
				draftRowsTable,
				selectedDraftRowEntries: [{ draftRowId, draftRow: draftRowsTable.map[draftRowId] }],
				hasDraftSelection: true,
				create,
				removeDraftRow,
				setDraftRowStatus,
				clearSelection,
				onSubmittedSuccessfully,
			}),
		);

		await act(async () => {
			await result.current.handleSubmitDraftRows();
		});

		expect(create).toHaveBeenCalledTimes(1);
		expect(removeDraftRow).toHaveBeenCalledTimes(0);
		expect(onSubmittedSuccessfully).toHaveBeenCalledTimes(0);
	});

	it('calls onSubmittedSuccessfully once for partial success batches', async () => {
		const create = vi
			.fn()
			.mockResolvedValueOnce({})
			.mockRejectedValueOnce(new Error('nope'));
		const removeDraftRow = vi.fn();
		const setDraftRowStatus = vi.fn();
		const clearSelection = vi.fn();
		const onSubmittedSuccessfully = vi.fn();

		const draftRowsTable = {
			order: ['draft:1', 'draft:2'],
			map: {
				'draft:1': {
					id: 'draft:1',
					values: { id: 'draft:id:1', name: 'A' },
					status: 'idle' as const,
					errors: null,
					createdAt: Date.now(),
					metaVersion: 'v1',
				},
				'draft:2': {
					id: 'draft:2',
					values: { id: 'draft:id:2', name: 'B' },
					status: 'idle' as const,
					errors: null,
					createdAt: Date.now(),
					metaVersion: 'v1',
				},
			},
			template: {},
			metaVersion: 'v1',
			columnOrder: ['id', 'name'],
		};

		const { result } = renderHook(() =>
			useDraftSubmission({
				tableKey: 'dashboard::db::users',
				draftRowsTable,
				selectedDraftRowEntries: [
					{ draftRowId: 'draft:1', draftRow: draftRowsTable.map['draft:1'] },
					{ draftRowId: 'draft:2', draftRow: draftRowsTable.map['draft:2'] },
				],
				hasDraftSelection: true,
				create,
				removeDraftRow,
				setDraftRowStatus,
				clearSelection,
				onSubmittedSuccessfully,
			}),
		);

		await act(async () => {
			await result.current.handleSubmitDraftRows();
		});

		expect(create).toHaveBeenCalledTimes(2);
		expect(removeDraftRow).toHaveBeenCalledTimes(1);
		expect(onSubmittedSuccessfully).toHaveBeenCalledTimes(1);
		expect(onSubmittedSuccessfully).toHaveBeenCalledWith({ success: 1, failed: 1 });
	});
});
