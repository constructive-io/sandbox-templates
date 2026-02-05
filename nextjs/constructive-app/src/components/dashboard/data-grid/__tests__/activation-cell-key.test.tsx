/**
 * @vitest-environment jsdom
 */

import { GridCellKind, type GridCell } from '@glideapps/glide-data-grid';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAppStore } from '@/store/app-store';

import { useGridEditors } from '../hooks/use-grid-editors';

vi.mock('@/lib/gql/hooks/dashboard/use-dashboard-meta-query', () => ({
	useMeta: vi.fn(() => ({ data: undefined })),
}));

describe('useGridEditors active cell tracking', () => {
	beforeEach(() => {
		useAppStore.setState((s: any) => ({
			...s,
			relationInfoCache: {},
			relationInfoMapCache: {},
		}));
	});

	it('tracks createdAt in activeCellRef even when activation UI is suppressed', () => {
		const columnKeys = ['id', 'createdAt', 'products'];
		const fieldMetaMap = new Map<string, any>();
		const data = [{ __isDraft: true, id: 'draft-1', createdAt: null, products: [] }];

		const { result } = renderHook(() => useGridEditors(columnKeys, fieldMetaMap, data as any[], 'posts'));

		act(() => {
			result.current.onCellActivated([2, 0]);
		});
		expect(result.current.activeCellRef.current).toEqual([2, 0]);

		act(() => {
			result.current.onCellActivated([1, 0]);
		});
		expect(result.current.activeCellRef.current).toEqual([1, 0]);

		const cell = {
			kind: GridCellKind.Text,
			data: '',
			displayData: '',
			allowOverlay: true,
		} satisfies GridCell;

		const editor = result.current.provideEditor(cell);
		expect(editor).toBeUndefined();
	});
});
