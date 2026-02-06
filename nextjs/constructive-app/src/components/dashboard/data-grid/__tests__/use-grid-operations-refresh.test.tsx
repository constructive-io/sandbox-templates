/**
 * @vitest-environment jsdom
 */

import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useGridOperations } from '../hooks/use-grid-operations';

describe('useGridOperations refresh callback', () => {
	it('calls onAfterServerDeletes once when at least one server delete succeeds', async () => {
		const deleteRow = vi.fn().mockResolvedValue({});
		const clearSelection = vi.fn();
		const onAfterServerDeletes = vi.fn();

		const data = [{ id: '1' }, { id: '2' }];
		const gridSelection = { rows: { toArray: () => [0, 1] } } as any;

		const { result } = renderHook(() =>
			useGridOperations(data as any[], deleteRow, gridSelection, clearSelection, {
				onAfterServerDeletes,
			}),
		);

		await act(async () => {
			await result.current.deleteSelected();
		});

		expect(deleteRow).toHaveBeenCalledTimes(2);
		expect(onAfterServerDeletes).toHaveBeenCalledTimes(1);
		expect(clearSelection).toHaveBeenCalledTimes(1);
	});

	it('does not call onAfterServerDeletes when only drafts are removed', async () => {
		const deleteRow = vi.fn().mockResolvedValue({});
		const clearSelection = vi.fn();
		const onAfterServerDeletes = vi.fn();
		const onRemoveDraftRow = vi.fn();

		const data = [{ __isDraft: true, __draftRowId: 'draft:1' }, { __isDraft: true, __draftRowId: 'draft:2' }];
		const gridSelection = { rows: { toArray: () => [0, 1] } } as any;

		const { result } = renderHook(() =>
			useGridOperations(data as any[], deleteRow, gridSelection, clearSelection, {
				onAfterServerDeletes,
				onRemoveDraftRow,
			}),
		);

		await act(async () => {
			await result.current.deleteSelected();
		});

		expect(deleteRow).toHaveBeenCalledTimes(0);
		expect(onRemoveDraftRow).toHaveBeenCalledTimes(2);
		expect(onAfterServerDeletes).toHaveBeenCalledTimes(0);
		expect(clearSelection).toHaveBeenCalledTimes(1);
	});
});
