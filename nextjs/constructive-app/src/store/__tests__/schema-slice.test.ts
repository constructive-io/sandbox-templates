/**
 * Schema Slice Tests
 * Consolidated: selection state, search params, custom schemas, API state
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { create, type StoreApi, type UseBoundStore } from 'zustand';

import { createSchemaSlice, type SchemaSlice } from '../schema-slice';

const mockLocalStorage = { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn(), clear: vi.fn() };
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

vi.mock('@/components/schema-builder/utils/schema-conversion', () => ({
	dbLightToSchemaData: vi.fn((s) => ({ name: s.name, nodes: [], edges: [] })),
}));

describe('Schema Slice', () => {
	let store: UseBoundStore<StoreApi<SchemaSlice>>;

	beforeEach(() => {
		vi.clearAllMocks();
		mockLocalStorage.getItem.mockReturnValue(null);
		store = create<SchemaSlice>(createSchemaSlice);
	});

	describe('Initial State', () => {
		it('has correct defaults', () => {
			const state = store.getState();
			expect(state.selectedSchemaKey).toBe('');
			expect(state.selectedTable).toBeNull();
			expect(state.selectedField).toBeNull();
			expect(state.activeTab).toBe('diagram');
			expect(state.searchParams).toEqual({ search: null, sort: 'name', order: 'asc', page: 1, limit: 20, selected: null });
		});
	});

	describe('Selection Actions', () => {
		it('selectSchema clears table/field', () => {
			store.setState({ selectedTable: 'table-1', selectedField: 'field-1' });
			store.getState().selectSchema('db-123');
			const state = store.getState();
			expect(state.selectedSchemaKey).toBe('db-123');
			expect(state.selectedTable).toBeNull();
			expect(state.selectedField).toBeNull();
		});

		it('selectTable clears field', () => {
			store.setState({ selectedField: 'field-1' });
			store.getState().selectTable('table-1');
			expect(store.getState().selectedTable).toBe('table-1');
			expect(store.getState().selectedField).toBeNull();
		});

		const selectionCases = [
			['selectTable', null, 'selectedTable'],
			['selectField', 'field-1', 'selectedField'],
			['setActiveTab', 'schemas', 'activeTab'],
		] as const;

		it.each(selectionCases)('%s sets %s', (action, value, key) => {
			(store.getState() as any)[action](value);
			expect((store.getState() as any)[key]).toBe(value);
		});
	});

	describe('Search Parameters', () => {
		it('setSearch resets page', () => {
			store.getState().setPage(3);
			store.getState().setSearch('test');
			expect(store.getState().searchParams.search).toBe('test');
			expect(store.getState().searchParams.page).toBe(1);
			expect(store.getState().hasActiveFilters).toBe(true);
		});

		it('setSorting resets page', () => {
			store.getState().setPage(3);
			store.getState().setSorting('created', 'desc');
			expect(store.getState().searchParams.sort).toBe('created');
			expect(store.getState().searchParams.order).toBe('desc');
			expect(store.getState().searchParams.page).toBe(1);
		});

		it('setSelected updates count', () => {
			store.getState().setSelected(['a', 'b']);
			expect(store.getState().searchParams.selected).toEqual(['a', 'b']);
			expect(store.getState().selectedCount).toBe(2);
		});

		it('clearFilters resets all', () => {
			store.getState().setSearch('test');
			store.getState().setSorting('created', 'desc');
			store.getState().setSelected(['a']);
			store.getState().clearFilters();
			const state = store.getState();
			expect(state.searchParams.search).toBeNull();
			expect(state.searchParams.sort).toBe('name');
			expect(state.hasActiveFilters).toBe(false);
		});
	});

	describe('Custom Schema Management', () => {
		it('creates custom schema', () => {
			store.getState().createCustomSchema('My Schema');
			expect(store.getState().selectedSchemaKey).toMatch(/^custom-/);
			expect(mockLocalStorage.setItem).toHaveBeenCalled();
		});

		it('deletes selected custom schema and clears selection', () => {
			const key = 'custom-123';
			mockLocalStorage.getItem.mockReturnValue(JSON.stringify({ [key]: { id: key, name: 'Test', tables: [], relationships: [] } }));
			store.setState({ selectedSchemaKey: key });
			store.getState().deleteCustomSchema(key);
			expect(store.getState().selectedSchemaKey).toBe('');
		});

		it('isCustomSchema identifies correctly', () => {
			expect(store.getState().isCustomSchema('db-123')).toBe(false);
			expect(store.getState().isCustomSchema('custom-123')).toBe(true);
		});
	});

	describe('API State', () => {
		it('sets and clears database API', () => {
			const api = { id: 'api-1', name: 'My API', url: 'http://localhost:3000/graphql' };
			store.getState().setCurrentDatabaseApi(api);
			expect(store.getState().currentDatabaseApi).toEqual(api);
			store.getState().setCurrentDatabaseApi(null);
			expect(store.getState().currentDatabaseApi).toBeNull();
		});
	});
});
