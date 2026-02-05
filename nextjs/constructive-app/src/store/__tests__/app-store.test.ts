/**
 * Test suite for app store integration
 * Tests the consolidated Zustand app store with multiple slices
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAppStore } from '../app-store';

// Mock localStorage
const mockLocalStorage = {
	getItem: vi.fn(),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
	value: mockLocalStorage,
});

// Mock the schema conversion utilities
vi.mock('@/components/schema-builder/utils/schema-conversion', () => ({
	dbLightToSchemaData: vi.fn((schema) => ({
		name: schema.name,
		description: schema.description,
		nodes: schema.tables.map((table: any) => ({
			id: table.id,
			type: 'table',
			data: { name: table.name, fields: table.fields },
			position: { x: 0, y: 0 },
		})),
		edges: [],
	})),
}));

describe('App Store Integration', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockLocalStorage.getItem.mockReturnValue(null);

		// Reset the store state
		useAppStore.setState({
			// Reset data grid slice
			starredTables: [],

			// Reset schema slice (simplified)
			selectedSchemaKey: '',
			selectedTable: null,
			selectedField: null,
			activeTab: 'diagram',
			customSchemas: [],
			currentDatabaseApi: null,
			searchParams: {
				search: null,
				sort: 'name',
				order: 'asc',
				page: 1,
				limit: 20,
				selected: null,
			},
			hasActiveFilters: false,
			selectedCount: 0,
		});
	});

	describe('Store Integration', () => {
		it('should have both data grid and schema slices available', () => {
			const state = useAppStore.getState();

			// Data grid slice properties
			expect(state.starredTables).toBeDefined();
			expect(state.toggleStarredTable).toBeDefined();
			expect(state.addStarredTable).toBeDefined();
			expect(state.removeStarredTable).toBeDefined();
			expect(state.clearStarredTables).toBeDefined();

			// Schema slice properties (simplified)
			expect(state.selectedSchemaKey).toBeDefined();
			expect(state.selectedTable).toBeDefined();
			expect(state.selectSchema).toBeDefined();
			expect(state.selectTable).toBeDefined();
			expect(state.setActiveTab).toBeDefined();
		});

		it('should maintain separate state for each slice', () => {
			const { toggleStarredTable, selectSchema, selectTable } = useAppStore.getState();

			// Modify data grid state
			toggleStarredTable('users');

			// Modify schema state
			selectSchema('db-123');
			selectTable('table-1');

			const state = useAppStore.getState();

			// Both slices should have their state updated independently
			expect(state.starredTables).toContain('users');
			expect(state.selectedSchemaKey).toBe('db-123');
			expect(state.selectedTable).toBe('table-1');
		});

		it('should support concurrent operations on both slices', () => {
			const { addStarredTable, removeStarredTable, selectSchema, selectTable, setActiveTab } = useAppStore.getState();

			// Perform operations on data grid slice
			addStarredTable('users');
			addStarredTable('posts');
			removeStarredTable('users');

			// Perform operations on schema slice
			selectSchema('db-123');
			selectTable('table-1');
			setActiveTab('schemas');

			const state = useAppStore.getState();

			// Verify data grid state
			expect(state.starredTables).toEqual(['posts']);

			// Verify schema state
			expect(state.selectedSchemaKey).toBe('db-123');
			expect(state.selectedTable).toBe('table-1');
			expect(state.activeTab).toBe('schemas');
		});
	});

	describe('Persistence Integration', () => {
		it('should have serialization functions for both slices', () => {
			const { toggleStarredTable, selectSchema, setActiveTab } = useAppStore.getState();

			// Set up state in both slices
			toggleStarredTable('users');
			selectSchema('db-456');
			setActiveTab('schemas');

			const state = useAppStore.getState();

			// Verify that both slices have state that can be serialized
			expect(state.starredTables).toContain('users');
			expect(state.selectedSchemaKey).toBe('db-456');
			expect(state.activeTab).toBe('schemas');
		});
	});

	describe('Schema Slice Selection', () => {
		it('should clear table and field selection when selecting schema', () => {
			const { selectSchema, selectTable, selectField } = useAppStore.getState();

			// Set initial selections
			useAppStore.setState({
				selectedTable: 'table-1',
				selectedField: 'field-1',
			});

			// Select a new schema
			selectSchema('db-789');

			const state = useAppStore.getState();
			expect(state.selectedSchemaKey).toBe('db-789');
			expect(state.selectedTable).toBeNull();
			expect(state.selectedField).toBeNull();
		});

		it('should clear field selection when selecting table', () => {
			const { selectTable, selectField } = useAppStore.getState();

			// Set initial field selection
			useAppStore.setState({ selectedField: 'field-1' });

			// Select a table
			selectTable('table-1');

			const state = useAppStore.getState();
			expect(state.selectedTable).toBe('table-1');
			expect(state.selectedField).toBeNull();
		});
	});

	describe('Schema Slice Search Params', () => {
		it('should manage search filters', () => {
			const { setSearch, setSorting, setSelected, clearFilters } = useAppStore.getState();

			// Set filters
			setSearch('test');
			setSorting('created', 'desc');
			setSelected(['item1', 'item2']);

			let state = useAppStore.getState();
			expect(state.searchParams.search).toBe('test');
			expect(state.searchParams.sort).toBe('created');
			expect(state.searchParams.order).toBe('desc');
			expect(state.searchParams.selected).toEqual(['item1', 'item2']);
			expect(state.hasActiveFilters).toBe(true);
			expect(state.selectedCount).toBe(2);

			// Clear filters
			clearFilters();

			state = useAppStore.getState();
			expect(state.searchParams.search).toBeNull();
			expect(state.searchParams.sort).toBe('name');
			expect(state.searchParams.order).toBe('asc');
			expect(state.searchParams.selected).toBeNull();
			expect(state.hasActiveFilters).toBe(false);
			expect(state.selectedCount).toBe(0);
		});
	});

	describe('Schema Slice API State', () => {
		it('should manage current database API', () => {
			const { setCurrentDatabaseApi } = useAppStore.getState();

			const api = {
				id: 'api-1',
				name: 'Test API',
				url: 'http://localhost:3000/graphql',
				domain: 'localhost',
				subdomain: 'api',
				isPublic: true,
			};

			setCurrentDatabaseApi(api);

			expect(useAppStore.getState().currentDatabaseApi).toEqual(api);

			// Clear API
			setCurrentDatabaseApi(null);
			expect(useAppStore.getState().currentDatabaseApi).toBeNull();
		});
	});

	describe('Cross-Slice Interactions', () => {
		it('should support operations that might affect both slices', () => {
			const { addStarredTable, selectSchema, selectTable, setActiveTab } = useAppStore.getState();

			// Select a schema
			selectSchema('db-123');

			// Star a table
			addStarredTable('users');

			// Select a table in schema builder
			selectTable('table-1');

			// Change tab
			setActiveTab('schemas');

			const state = useAppStore.getState();

			// Both slices should work correctly
			expect(state.starredTables).toContain('users');
			expect(state.selectedSchemaKey).toBe('db-123');
			expect(state.selectedTable).toBe('table-1');
			expect(state.activeTab).toBe('schemas');
		});
	});
});
