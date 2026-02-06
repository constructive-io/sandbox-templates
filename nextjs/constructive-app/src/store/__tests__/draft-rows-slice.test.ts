import { beforeEach, describe, expect, it } from 'vitest';
import { create } from 'zustand';

import { computeDraftMetaSignature, createDraftRowsSlice, type DraftRowsSlice } from '../draft-rows-slice';

type DraftRowsStore = DraftRowsSlice;

describe('draftRowsSlice', () => {
	let useDraftStore: ReturnType<typeof create<DraftRowsStore>>;

	beforeEach(() => {
		useDraftStore = create<DraftRowsStore>()((...args) => ({
			...createDraftRowsSlice(...args),
		}));
	});

	it('creates draft rows with template defaults', () => {
		const tableKey = 'default::users';
		const columnOrder = ['id', 'name', 'isActive'] as const;
		const fieldMeta = {
			id: { name: 'id', type: { gqlType: 'UUID', isArray: false } },
			name: { name: 'name', type: { gqlType: 'String', isArray: false } },
			isActive: { name: 'isActive', type: { gqlType: 'Boolean', isArray: false, pgAlias: 'boolean' } },
		} as const;

		const metaSignature = computeDraftMetaSignature(columnOrder, fieldMeta, {});

		const draftId = useDraftStore
			.getState()
			.createDraftRow({ tableKey, columnOrder, fieldMetaByKey: fieldMeta, metaVersion: metaSignature });

		const tableState = useDraftStore.getState().draftRowsByTable[tableKey];
		expect(tableState).toBeDefined();
		const draftRow = tableState?.map[draftId];
		expect(draftRow).toBeDefined();
		expect(draftRow?.values.id).toBe(draftId);
		expect(draftRow?.values.name).toBeNull();
		// Boolean fields default to false so they render as checkboxes instead of text cells
		expect(draftRow?.values.isActive).toBe(false);
	});

	it('updates draft cells and applies extra values', () => {
		const tableKey = 'default::projects';
		const columnOrder = ['id', 'owner', 'ownerId'] as const;
		const fieldMeta = {
			id: { name: 'id', type: { gqlType: 'UUID', isArray: false } },
			owner: undefined,
			ownerId: { name: 'ownerId', type: { gqlType: 'UUID', isArray: false } },
		} as const;

		const relationInfo = {
			owner: {
				kind: 'belongsTo' as const,
				relationField: 'owner',
				foreignKeyField: 'ownerId',
				displayCandidates: [],
			},
		};

		const signature = computeDraftMetaSignature(columnOrder, fieldMeta, relationInfo);

		const draftId = useDraftStore.getState().createDraftRow({
			tableKey,
			columnOrder,
			fieldMetaByKey: fieldMeta,
			relationInfoByKey: relationInfo,
			metaVersion: signature,
		});

		useDraftStore.getState().updateDraftCell({
			tableKey,
			draftRowId: draftId,
			columnKey: 'owner',
			value: { id: 'user-1', name: 'Jane' },
			extraValues: { ownerId: 'user-1' },
		});

		const updated = useDraftStore.getState().draftRowsByTable[tableKey]?.map[draftId];
		expect(updated?.values.owner).toEqual({ id: 'user-1', name: 'Jane' });
		expect(updated?.values.ownerId).toBe('user-1');
	});

	it('syncs existing drafts when metadata changes', () => {
		const tableKey = 'default::tasks';
		const initialColumns = ['id', 'title'] as const;
		const initialMeta = {
			id: { name: 'id', type: { gqlType: 'UUID', isArray: false } },
			title: { name: 'title', type: { gqlType: 'String', isArray: false } },
		} as const;

		const initialSignature = computeDraftMetaSignature(initialColumns, initialMeta, {});

		const draftId = useDraftStore.getState().createDraftRow({
			tableKey,
			columnOrder: initialColumns,
			fieldMetaByKey: initialMeta,
			metaVersion: initialSignature,
		});

		useDraftStore.getState().updateDraftCell({
			tableKey,
			draftRowId: draftId,
			columnKey: 'title',
			value: 'First',
		});

		const nextColumns = ['id', 'title', 'status'] as const;
		const nextMeta = {
			...initialMeta,
			status: { name: 'status', type: { gqlType: 'String', isArray: false } },
		} as const;

		const nextSignature = computeDraftMetaSignature(nextColumns, nextMeta, {});

		useDraftStore.getState().syncDraftRowsWithMeta({
			tableKey,
			columnOrder: nextColumns,
			fieldMetaByKey: nextMeta,
			metaVersion: nextSignature,
		});

		const synced = useDraftStore.getState().draftRowsByTable[tableKey]?.map[draftId];
		expect(synced?.values.title).toBe('First');
		expect(synced?.values.status).toBeNull();
	});

	it('clears all drafts', () => {
		const tableKey = 'default::users';
		const columnOrder = ['id'] as const;
		const fieldMeta = {
			id: { name: 'id', type: { gqlType: 'UUID', isArray: false } },
		} as const;

		const metaSignature = computeDraftMetaSignature(columnOrder, fieldMeta, {});
		useDraftStore.getState().createDraftRow({ tableKey, columnOrder, fieldMetaByKey: fieldMeta, metaVersion: metaSignature });
		expect(Object.keys(useDraftStore.getState().draftRowsByTable).length).toBe(1);

		useDraftStore.getState().clearAllDraftRows();
		expect(useDraftStore.getState().draftRowsByTable).toEqual({});
	});

	it('clears drafts for a databaseId', () => {
		const columnOrder = ['id'] as const;
		const fieldMeta = {
			id: { name: 'id', type: { gqlType: 'UUID', isArray: false } },
		} as const;
		const metaSignature = computeDraftMetaSignature(columnOrder, fieldMeta, {});

		useDraftStore.getState().createDraftRow({
			tableKey: 'dashboard::db-1::users',
			columnOrder,
			fieldMetaByKey: fieldMeta,
			metaVersion: metaSignature,
		});
		useDraftStore.getState().createDraftRow({
			tableKey: 'dashboard::db-2::users',
			columnOrder,
			fieldMetaByKey: fieldMeta,
			metaVersion: metaSignature,
		});
		useDraftStore.getState().createDraftRow({
			tableKey: 'schema-builder::db-1::projects',
			columnOrder,
			fieldMetaByKey: fieldMeta,
			metaVersion: metaSignature,
		});

		useDraftStore.getState().clearDraftRowsForDatabase('db-1');
		const keys = Object.keys(useDraftStore.getState().draftRowsByTable).sort();
		expect(keys).toEqual(['dashboard::db-2::users']);
	});
});
