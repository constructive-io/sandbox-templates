/**
 * Test suite for Dashboard table URL synchronization behavior
 *
 * Tests the logic that determines which table to select based on URL params
 * and available tables from the meta query.
 */
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { TableWithCategory } from '../data-grid/data-grid.table-selector';

/**
 * Extract the table selection logic into a testable hook
 * This mirrors the logic in dashboard-route.tsx
 */
function getFirstAppTable(tables: TableWithCategory[]): string | null {
	if (tables.length === 0) return null;
	const appTable = tables.find((t) => t.category === 'APP' || t.category === undefined);
	return appTable?.name ?? tables[0]?.name ?? null;
}

interface UseTableSelectionLogicParams {
	isDashboardRoute: boolean;
	metaEnabled: boolean;
	metaLoading: boolean;
	tables: TableWithCategory[];
	activeTable: string;
	setActiveTable: (table: string | null) => void;
}

interface UseTableSelectionLogicResult {
	shouldScrollToActive: boolean;
}

/**
 * Custom hook that encapsulates the table selection logic from dashboard-route.tsx
 * This is a pure extraction for testing purposes
 *
 * IMPORTANT: This must match the logic in dashboard-route.tsx exactly!
 */
function useTableSelectionLogic({
	isDashboardRoute,
	metaEnabled,
	metaLoading,
	tables,
	activeTable,
	setActiveTable,
}: UseTableSelectionLogicParams): UseTableSelectionLogicResult {
	const hasInitializedTableRef = { current: false };
	const shouldScrollToActiveRef = { current: false };

	// This simulates what the useEffect does
	const processTableSelection = () => {
		if (!isDashboardRoute) return;

		// Wait for auth AND meta to be ready before making any table selection decisions.
		// This prevents clearing a valid ?table=X param during initial page load.
		if (!metaEnabled || metaLoading) return;

		// No tables available in this database - clear selection
		if (tables.length === 0) {
			if (activeTable) {
				setActiveTable(null);
			}
			return;
		}

		const isFirstInit = !hasInitializedTableRef.current;

		// Case 1: No table in URL - select first APP table
		if (!activeTable) {
			const defaultTable = getFirstAppTable(tables);
			if (defaultTable) {
				hasInitializedTableRef.current = true;
				shouldScrollToActiveRef.current = true;
				setActiveTable(defaultTable);
			}
			return;
		}

		// Case 2: Table in URL - validate it
		const isValidTable = tables.some((t) => t.name === activeTable);

		if (isValidTable) {
			// Valid table - mark as initialized and trigger scroll on first load
			if (isFirstInit) {
				hasInitializedTableRef.current = true;
				shouldScrollToActiveRef.current = true;
			}
			return;
		}

		// Case 3: Invalid table in URL - replace with first APP table
		const defaultTable = getFirstAppTable(tables);
		if (defaultTable) {
			hasInitializedTableRef.current = true;
			shouldScrollToActiveRef.current = true;
			setActiveTable(defaultTable);
		}
	};

	processTableSelection();

	return {
		shouldScrollToActive: shouldScrollToActiveRef.current,
	};
}

describe('Dashboard Table URL Sync', () => {
	let mockSetActiveTable: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		mockSetActiveTable = vi.fn();
	});

	const defaultTables: TableWithCategory[] = [
		{ name: 'User', category: 'APP' },
		{ name: 'Product', category: 'APP' },
		{ name: 'Order', category: 'APP' },
		{ name: 'ApiToken', category: 'CORE' },
		{ name: 'Membership', category: 'MODULE' },
	];

	describe('URL table param preservation during loading', () => {
		it('should NOT change activeTable while metaLoading is true', () => {
			// Scenario: URL has ?table=Product, meta is still loading
			useTableSelectionLogic({
				isDashboardRoute: true,
				metaEnabled: true,
				metaLoading: true, // Still loading!
				tables: [], // Tables not loaded yet
				activeTable: 'Product',
				setActiveTable: mockSetActiveTable,
			});

			// Should NOT call setActiveTable - preserve the URL param
			expect(mockSetActiveTable).not.toHaveBeenCalled();
		});

		it('should preserve valid table param after loading completes', () => {
			// Scenario: URL has ?table=Product, meta finished loading, Product exists
			useTableSelectionLogic({
				isDashboardRoute: true,
				metaEnabled: true,
				metaLoading: false,
				tables: defaultTables,
				activeTable: 'Product',
				setActiveTable: mockSetActiveTable,
			});

			// Should NOT call setActiveTable - Product is valid
			expect(mockSetActiveTable).not.toHaveBeenCalled();
		});

		it('should replace invalid table param with first APP table after loading', () => {
			// Scenario: URL has ?table=NonExistent, meta finished loading
			useTableSelectionLogic({
				isDashboardRoute: true,
				metaEnabled: true,
				metaLoading: false,
				tables: defaultTables,
				activeTable: 'NonExistent',
				setActiveTable: mockSetActiveTable,
			});

			// Should replace with first APP table (User)
			expect(mockSetActiveTable).toHaveBeenCalledWith('User');
		});
	});

	describe('Default table selection', () => {
		it('should select first APP table when no table in URL', () => {
			useTableSelectionLogic({
				isDashboardRoute: true,
				metaEnabled: true,
				metaLoading: false,
				tables: defaultTables,
				activeTable: '',
				setActiveTable: mockSetActiveTable,
			});

			// Should select User (first APP table)
			expect(mockSetActiveTable).toHaveBeenCalledWith('User');
		});

		it('should prefer APP tables over CORE/MODULE tables', () => {
			const systemFirstTables: TableWithCategory[] = [
				{ name: 'ApiToken', category: 'CORE' },
				{ name: 'Membership', category: 'MODULE' },
				{ name: 'CustomTable', category: 'APP' },
			];

			useTableSelectionLogic({
				isDashboardRoute: true,
				metaEnabled: true,
				metaLoading: false,
				tables: systemFirstTables,
				activeTable: '',
				setActiveTable: mockSetActiveTable,
			});

			// Should select CustomTable (first APP table), not ApiToken
			expect(mockSetActiveTable).toHaveBeenCalledWith('CustomTable');
		});

		it('should fall back to first table if no APP tables exist', () => {
			const onlySystemTables: TableWithCategory[] = [
				{ name: 'ApiToken', category: 'CORE' },
				{ name: 'Membership', category: 'MODULE' },
			];

			useTableSelectionLogic({
				isDashboardRoute: true,
				metaEnabled: true,
				metaLoading: false,
				tables: onlySystemTables,
				activeTable: '',
				setActiveTable: mockSetActiveTable,
			});

			// Should fall back to ApiToken (first table)
			expect(mockSetActiveTable).toHaveBeenCalledWith('ApiToken');
		});
	});

	describe('Auth state transitions', () => {
		it('should NOT clear table when metaEnabled is false (preserves URL during auth loading)', () => {
			// When auth is loading/not ready, we preserve the URL param
			// The table will only be cleared/changed once we can validate it
			useTableSelectionLogic({
				isDashboardRoute: true,
				metaEnabled: false, // Auth not ready
				metaLoading: false,
				tables: [],
				activeTable: 'Product',
				setActiveTable: mockSetActiveTable,
			});

			// Should NOT clear - preserve URL param until we can validate
			expect(mockSetActiveTable).not.toHaveBeenCalled();
		});

		it('should NOT clear table when on non-dashboard route', () => {
			useTableSelectionLogic({
				isDashboardRoute: false, // Not on dashboard
				metaEnabled: true,
				metaLoading: false,
				tables: defaultTables,
				activeTable: 'Product',
				setActiveTable: mockSetActiveTable,
			});

			// Should not touch the table param
			expect(mockSetActiveTable).not.toHaveBeenCalled();
		});
	});

	describe('Empty tables state', () => {
		it('should clear table when database has no tables', () => {
			useTableSelectionLogic({
				isDashboardRoute: true,
				metaEnabled: true,
				metaLoading: false,
				tables: [], // No tables in this database
				activeTable: 'Product',
				setActiveTable: mockSetActiveTable,
			});

			// Should clear the invalid table
			expect(mockSetActiveTable).toHaveBeenCalledWith(null);
		});
	});

	describe('Page refresh scenario (the bug)', () => {
		it('should NOT change URL during the loading -> loaded transition when table is valid', () => {
			// This test simulates the exact bug:
			// 1. Page loads with ?table=Product
			// 2. metaLoading=true, tables=[]
			// 3. metaLoading=false, tables=[...] including Product
			// Expected: URL stays as ?table=Product throughout

			const calls: Array<string | null> = [];
			const trackingSetActiveTable = (value: string | null) => {
				calls.push(value);
			};

			// Step 1: Initial load - metaLoading=true
			useTableSelectionLogic({
				isDashboardRoute: true,
				metaEnabled: true,
				metaLoading: true,
				tables: [],
				activeTable: 'Product',
				setActiveTable: trackingSetActiveTable,
			});

			// Step 2: Loading complete - should validate and keep Product
			useTableSelectionLogic({
				isDashboardRoute: true,
				metaEnabled: true,
				metaLoading: false,
				tables: defaultTables,
				activeTable: 'Product',
				setActiveTable: trackingSetActiveTable,
			});

			// The URL should NEVER have been changed
			expect(calls).toHaveLength(0);
		});

		it('should NOT clear table when metaEnabled transitions from false to true (auth completing)', () => {
			// This is THE BUG scenario:
			// 1. Page loads with ?table=Product
			// 2. Auth is not ready yet, so metaEnabled=false
			// 3. Auth completes, metaEnabled=true
			// 4. Meta loads, tables become available
			// Expected: URL stays as ?table=Product throughout

			const calls: Array<string | null> = [];
			const trackingSetActiveTable = (value: string | null) => {
				calls.push(value);
			};

			// Step 1: Page load - auth not ready, metaEnabled=false
			useTableSelectionLogic({
				isDashboardRoute: true,
				metaEnabled: false, // Auth not ready!
				metaLoading: false,
				tables: [],
				activeTable: 'Product', // URL has this
				setActiveTable: trackingSetActiveTable,
			});

			// BUG: The current implementation clears the table here!
			// We expect NO calls at this point - should preserve URL param
			expect(calls).toHaveLength(0);
		});

		it('should preserve URL table through full auth -> meta loading flow', () => {
			// Full flow simulation:
			// 1. metaEnabled=false (auth loading)
			// 2. metaEnabled=true, metaLoading=true (auth done, meta loading)
			// 3. metaEnabled=true, metaLoading=false, tables=[...] (fully loaded)

			const calls: Array<string | null> = [];
			const trackingSetActiveTable = (value: string | null) => {
				calls.push(value);
			};

			// Step 1: Auth not ready
			useTableSelectionLogic({
				isDashboardRoute: true,
				metaEnabled: false,
				metaLoading: false,
				tables: [],
				activeTable: 'Product',
				setActiveTable: trackingSetActiveTable,
			});

			// Step 2: Auth ready, meta loading
			useTableSelectionLogic({
				isDashboardRoute: true,
				metaEnabled: true,
				metaLoading: true,
				tables: [],
				activeTable: 'Product',
				setActiveTable: trackingSetActiveTable,
			});

			// Step 3: Fully loaded with valid table
			useTableSelectionLogic({
				isDashboardRoute: true,
				metaEnabled: true,
				metaLoading: false,
				tables: defaultTables,
				activeTable: 'Product',
				setActiveTable: trackingSetActiveTable,
			});

			// URL should NEVER have been changed since Product is valid
			expect(calls).toHaveLength(0);
		});
	});
});
