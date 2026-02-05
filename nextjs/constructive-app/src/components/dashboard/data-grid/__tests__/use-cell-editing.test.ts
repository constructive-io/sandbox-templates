/**
 * @vitest-environment jsdom
 *
 * Tests for useCellEditing hook - the dispatch layer for cell edits.
 *
 * This hook routes edits to either:
 * - Server mutation (via update function) for persisted rows
 * - Local state update (via updateDraftCell) for draft rows
 * - Noop for protected columns or invalid indices
 *
 * Return type: CellEditingResult object with type discriminant.
 */

import { act, renderHook } from '@testing-library/react';
import { GridCellKind, type GridCell, type Item } from '@glideapps/glide-data-grid';
import { describe, expect, it, vi } from 'vitest';

import { useCellEditing, type CellEditingResult } from '../hooks/use-cell-editing';

function createTextCell(value: string): GridCell {
	return { kind: GridCellKind.Text, data: value, displayData: value, allowOverlay: true };
}

describe('useCellEditing', () => {
	describe('server row editing', () => {
		it('calls update function and returns server response', async () => {
			const update = vi.fn().mockResolvedValue({ updatedRow: { id: '1', name: 'Updated' } });
			const updateDraftCell = vi.fn();
			const onCellEdit = vi.fn();

			const serverRow = { id: '1', name: 'Original' };
			const combinedRows = [serverRow];
			const gridColumnKeys = ['id', 'name'];
			const fieldMetaMap = new Map([
				['id', { name: 'id', type: { gqlType: 'UUID' } }],
				['name', { name: 'name', type: { gqlType: 'String' } }],
			]);

			const { result } = renderHook(() =>
				useCellEditing({
					gridColumnKeys,
					combinedRows,
					fieldMetaMap,
					relationInfoByField: new Map(),
					updateDraftCell,
					tableKey: 'test::table',
					update,
					onCellEdit,
				}),
			);

			const cell: Item = [1, 0]; // column 1 (name), row 0
			const newValue = createTextCell('Updated');

			let editResult: CellEditingResult | undefined;
			await act(async () => {
				editResult = await result.current(cell, newValue);
			});

			// Verify return type includes server response for cache updates
			expect(editResult).toMatchObject({
				type: 'server',
				patchField: 'name',
				patchValue: 'Updated',
				updatedRow: { id: '1', name: 'Updated' },
			});
			expect(update).toHaveBeenCalledWith('1', { name: 'Updated' });
			expect(onCellEdit).toHaveBeenCalledWith('1', 'name', 'Updated');
			expect(updateDraftCell).not.toHaveBeenCalled();
		});

		it('blocks edits to UUID primary key id column', async () => {
			const update = vi.fn().mockResolvedValue({});
			const updateDraftCell = vi.fn();

			const serverRow = { id: 'uuid-1', name: 'Test' };
			const combinedRows = [serverRow];
			const gridColumnKeys = ['id', 'name'];
			const fieldMetaMap = new Map([
				['id', { name: 'id', type: { gqlType: 'UUID' } }],
				['name', { name: 'name', type: { gqlType: 'String' } }],
			]);

			const { result } = renderHook(() =>
				useCellEditing({
					gridColumnKeys,
					combinedRows,
					fieldMetaMap,
					relationInfoByField: new Map(),
					updateDraftCell,
					tableKey: 'test::table',
					update,
				}),
			);

			const cell: Item = [0, 0]; // column 0 (id), row 0
			const newValue = createTextCell('new-uuid');

			let editResult: CellEditingResult | undefined;
			await act(async () => {
				editResult = await result.current(cell, newValue);
			});

			// Should complete without calling update (id is protected)
			expect(editResult?.type).toBe('noop');
			expect(update).not.toHaveBeenCalled();
		});
	});

	describe('draft row editing', () => {
		it('calls updateDraftCell for draft row edits', async () => {
			const update = vi.fn().mockResolvedValue({});
			const updateDraftCell = vi.fn();

			// Create a draft row with non-enumerable properties
			const draftRow = { id: 'draft:id', name: 'Draft Name' };
			Object.defineProperty(draftRow, '__isDraft', { value: true, enumerable: false });
			Object.defineProperty(draftRow, '__draftRowId', { value: 'draft:1', enumerable: false });

			const combinedRows = [draftRow];
			const gridColumnKeys = ['id', 'name'];
			const fieldMetaMap = new Map([
				['id', { name: 'id', type: { gqlType: 'UUID' } }],
				['name', { name: 'name', type: { gqlType: 'String' } }],
			]);

			const { result } = renderHook(() =>
				useCellEditing({
					gridColumnKeys,
					combinedRows,
					fieldMetaMap,
					relationInfoByField: new Map(),
					updateDraftCell,
					tableKey: 'test::table',
					update,
				}),
			);

			const cell: Item = [1, 0]; // column 1 (name), row 0
			const newValue = createTextCell('Updated Draft');

			let editResult: CellEditingResult | undefined;
			await act(async () => {
				editResult = await result.current(cell, newValue);
			});

			expect(editResult?.type).toBe('draft');
			expect(updateDraftCell).toHaveBeenCalledTimes(1);
			expect(updateDraftCell).toHaveBeenCalledWith({
				tableKey: 'test::table',
				draftRowId: 'draft:1',
				columnKey: 'name',
				value: 'Updated Draft',
				extraValues: undefined,
			});
			expect(update).not.toHaveBeenCalled();
		});

		it('blocks edits to draft row id column', async () => {
			const update = vi.fn().mockResolvedValue({});
			const updateDraftCell = vi.fn();

			const draftRow = { id: 'draft:id', name: 'Draft Name' };
			Object.defineProperty(draftRow, '__isDraft', { value: true, enumerable: false });
			Object.defineProperty(draftRow, '__draftRowId', { value: 'draft:1', enumerable: false });

			const combinedRows = [draftRow];
			const gridColumnKeys = ['id', 'name'];
			const fieldMetaMap = new Map([
				['id', { name: 'id', type: { gqlType: 'UUID' } }],
				['name', { name: 'name', type: { gqlType: 'String' } }],
			]);

			const { result } = renderHook(() =>
				useCellEditing({
					gridColumnKeys,
					combinedRows,
					fieldMetaMap,
					relationInfoByField: new Map(),
					updateDraftCell,
					tableKey: 'test::table',
					update,
				}),
			);

			const cell: Item = [0, 0]; // column 0 (id), row 0
			const newValue = createTextCell('new-draft-id');

			let editResult: CellEditingResult | undefined;
			await act(async () => {
				editResult = await result.current(cell, newValue);
			});

			expect(editResult?.type).toBe('noop');
			expect(updateDraftCell).not.toHaveBeenCalled();
			expect(update).not.toHaveBeenCalled();
		});
	});

	describe('mixed rows (server + draft)', () => {
		it('correctly routes edits based on row type when both present', async () => {
			const update = vi.fn().mockResolvedValue({ updatedRow: { id: '1', name: 'Updated' } });
			const updateDraftCell = vi.fn();

			const serverRow = { id: '1', name: 'Server' };
			const draftRow = { id: 'draft:id', name: 'Draft' };
			Object.defineProperty(draftRow, '__isDraft', { value: true, enumerable: false });
			Object.defineProperty(draftRow, '__draftRowId', { value: 'draft:1', enumerable: false });

			const combinedRows = [serverRow, draftRow];
			const gridColumnKeys = ['id', 'name'];
			const fieldMetaMap = new Map([
				['id', { name: 'id', type: { gqlType: 'UUID' } }],
				['name', { name: 'name', type: { gqlType: 'String' } }],
			]);

			const { result } = renderHook(() =>
				useCellEditing({
					gridColumnKeys,
					combinedRows,
					fieldMetaMap,
					relationInfoByField: new Map(),
					updateDraftCell,
					tableKey: 'test::table',
					update,
				}),
			);

			// Edit server row (row 0) -> should call update
			let serverResult: CellEditingResult | undefined;
			await act(async () => {
				serverResult = await result.current([1, 0], createTextCell('Server Updated'));
			});
			expect(serverResult?.type).toBe('server');
			expect(update).toHaveBeenCalledWith('1', { name: 'Server Updated' });

			// Edit draft row (row 1) -> should call updateDraftCell
			let draftResult: CellEditingResult | undefined;
			await act(async () => {
				draftResult = await result.current([1, 1], createTextCell('Draft Updated'));
			});
			expect(draftResult?.type).toBe('draft');
			expect(updateDraftCell).toHaveBeenCalled();
		});
	});

	describe('edge cases', () => {
		it('returns noop for out-of-bounds indices and special columns', async () => {
			const update = vi.fn();
			const updateDraftCell = vi.fn();

			const serverRow = { id: '1', name: 'Test' };
			const combinedRows = [serverRow];
			const gridColumnKeys = ['id', 'name', '__draft_action__'];
			const fieldMetaMap = new Map([
				['id', { name: 'id', type: { gqlType: 'UUID' } }],
				['name', { name: 'name', type: { gqlType: 'String' } }],
			]);

			const { result } = renderHook(() =>
				useCellEditing({
					gridColumnKeys,
					combinedRows,
					fieldMetaMap,
					relationInfoByField: new Map(),
					updateDraftCell,
					tableKey: 'test::table',
					update,
				}),
			);

			// Invalid column index
			let r1: CellEditingResult | undefined;
			await act(async () => {
				r1 = await result.current([99, 0], createTextCell('Test'));
			});
			expect(r1?.type).toBe('noop');

			// Invalid row index
			let r2: CellEditingResult | undefined;
			await act(async () => {
				r2 = await result.current([1, 99], createTextCell('Test'));
			});
			expect(r2?.type).toBe('noop');

			// Draft action column
			let r3: CellEditingResult | undefined;
			await act(async () => {
				r3 = await result.current([2, 0], createTextCell('Test'));
			});
			expect(r3?.type).toBe('noop');

			// None should have called mutation functions
			expect(update).not.toHaveBeenCalled();
			expect(updateDraftCell).not.toHaveBeenCalled();
		});
	});
});
