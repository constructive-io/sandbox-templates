/**
 * @vitest-environment jsdom
 */

import { act, renderHook } from '@testing-library/react';
import { GridCellKind } from '@glideapps/glide-data-grid';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAppStore } from '@/store/app-store';

import { useGridContent } from '../hooks/use-grid-content';

vi.mock('@/lib/gql/hooks/dashboard/use-dashboard-meta-query', () => ({
	useMeta: vi.fn(() => ({ data: undefined })),
}));

describe('Relation cache reactivity', () => {
	beforeEach(() => {
		useAppStore.setState((s: any) => ({
			...s,
			relationInfoCache: {},
			relationInfoMapCache: {},
		}));
	});

	it('updates getCellContent when relation cache is populated', () => {
		const tableName = 'posts';
		const data = [{ id: '1', comments: [{ name: 'Alice' }, { name: 'Bob' }] }];
		const columnKeys = ['comments'];
		const fieldMetaMap = new Map<string, any>();

		const { result } = renderHook(() =>
			useGridContent(
				data,
				columnKeys,
				fieldMetaMap,
				() => ({ kind: GridCellKind.Text, data: '', displayData: '', allowOverlay: true }),
				tableName,
			),
		);

		const before = result.current.getCellContent([0, 0]);
		expect(before.kind).toBe(GridCellKind.Text);

		act(() => {
			useAppStore.getState().setRelationInfoForTable(tableName, {
				comments: {
					kind: 'hasMany',
					relatedTable: 'comments',
					displayCandidates: ['name'],
					relationField: 'comments',
					foreignKeyField: 'postId',
				},
			});
		});

		const after = result.current.getCellContent([0, 0]);
		expect(after.kind).toBe(GridCellKind.Bubble);
		expect((after as any).activationBehaviorOverride).toBe('double-click');
	});

	it('shows empty bubble cell for hasMany relations in draft rows', () => {
		const tableName = 'posts';
		const data = [{ __isDraft: true, id: 'draft:abc', comments: [] }];
		const columnKeys = ['comments'];
		const fieldMetaMap = new Map<string, any>();

		useAppStore.setState((s: any) => ({
			...s,
			relationInfoMapCache: {
				posts: new Map([
					[
						'comments',
						{
							kind: 'hasMany',
							relatedTable: 'comments',
							displayCandidates: ['name'],
							relationField: 'comments',
							foreignKeyField: 'postId',
						},
					],
				]),
			},
		}));

		const { result } = renderHook(() =>
			useGridContent(
				data,
				columnKeys,
				fieldMetaMap,
				() => ({ kind: GridCellKind.Text, data: '', displayData: '', allowOverlay: true }),
				tableName,
			),
		);

		const cell = result.current.getCellContent([0, 0]);
		expect(cell.kind).toBe(GridCellKind.Bubble);
		expect((cell as any).data).toEqual([]);
		expect((cell as any).activationBehaviorOverride).toBe('double-click');
	});
});

describe('Draft row timestamp styling', () => {
	beforeEach(() => {
		useAppStore.setState((s: any) => ({
			...s,
			relationInfoCache: {},
			relationInfoMapCache: {},
		}));
	});

	it('applies disabled styling to createdAt in draft rows', () => {
		const tableName = 'posts';
		const data = [{ __isDraft: true, id: 'draft:abc', createdAt: null }];
		const columnKeys = ['createdAt'];
		const fieldMetaMap = new Map<string, any>([
			['createdAt', { name: 'createdAt', type: { gqlType: 'Datetime', isArray: false } }],
		]);

		const { result } = renderHook(() =>
			useGridContent(
				data,
				columnKeys,
				fieldMetaMap,
				() => ({ kind: GridCellKind.Text, data: '', displayData: '', allowOverlay: true }),
				tableName,
			),
		);

		const cell = result.current.getCellContent([0, 0]);
		expect(cell.allowOverlay).toBe(false);
		expect((cell as any).style).toBe('faded');
		expect((cell as any).cursor).toBe('not-allowed');
		expect((cell as any).themeOverride?.bgCell).toBe('#F9FAFB');
	});

	it('applies disabled styling to updatedAt in draft rows', () => {
		const tableName = 'posts';
		const data = [{ __isDraft: true, id: 'draft:abc', updatedAt: null }];
		const columnKeys = ['updatedAt'];
		const fieldMetaMap = new Map<string, any>([
			['updatedAt', { name: 'updatedAt', type: { gqlType: 'Datetime', isArray: false } }],
		]);

		const { result } = renderHook(() =>
			useGridContent(
				data,
				columnKeys,
				fieldMetaMap,
				() => ({ kind: GridCellKind.Text, data: '', displayData: '', allowOverlay: true }),
				tableName,
			),
		);

		const cell = result.current.getCellContent([0, 0]);
		expect(cell.allowOverlay).toBe(false);
		expect((cell as any).style).toBe('faded');
		expect((cell as any).cursor).toBe('not-allowed');
	});

	it('does not apply disabled styling to createdAt in server rows', () => {
		const tableName = 'posts';
		const data = [{ id: '123', createdAt: '2024-01-01T00:00:00Z' }];
		const columnKeys = ['createdAt'];
		const fieldMetaMap = new Map<string, any>([
			['createdAt', { name: 'createdAt', type: { gqlType: 'Datetime', isArray: false } }],
		]);

		const { result } = renderHook(() =>
			useGridContent(
				data,
				columnKeys,
				fieldMetaMap,
				() => ({ kind: GridCellKind.Text, data: '', displayData: '', allowOverlay: true }),
				tableName,
			),
		);

		const cell = result.current.getCellContent([0, 0]);
		expect(cell.allowOverlay).toBe(true);
		expect((cell as any).style).toBeUndefined();
		expect((cell as any).cursor).toBeUndefined();
	});
});
