'use client';

import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import * as inflection from 'inflection';
import { parseAsString, useQueryState } from 'nuqs';

import { useAuthContext } from '@/lib/auth/auth-context';
import { useMeta } from '@/lib/gql/hooks/dashboard/use-dashboard-meta-query';
import { QueryErrorBoundary } from '@/lib/gql/query-error-boundary';
import { useEntityParams } from '@/lib/navigation';
import { useDashboardContext } from '@/components/dashboard/dashboard-context-selector';
import {
	DashboardStateDisplay,
	getDashboardState,
	type DashboardStateConfig,
} from '@/components/dashboard/dashboard-state-display';
import { DashboardUnselectedTable } from '@/components/dashboard/dashboard-unselected-table';
import { DashboardGridSkeleton } from '@/components/skeletons';
import type { TableWithCategory } from '@/components/dashboard/data-grid/data-grid.table-selector';
import { TableSelector } from '@/components/dashboard/data-grid/data-grid.table-selector';

// Dynamic import: DataGridV2 includes @glideapps/glide-data-grid (~270KB)
// Code split from initial bundle - only loaded when data route is accessed
const DataGridV2 = dynamic(() => import('@/components/dashboard/data-grid/data-grid').then((m) => m.DataGridV2), {
	ssr: false,
	loading: () => <DashboardGridSkeleton />,
});

/**
 * Get the first APP (non-system) table from the list.
 * Falls back to first table if no APP tables exist.
 */
function getFirstAppTable(tables: TableWithCategory[]): string | null {
	if (tables.length === 0) return null;
	// Prefer APP tables (category === 'APP' or no category means user-created)
	const appTable = tables.find((t) => t.category === 'APP' || t.category === undefined);
	return appTable?.name ?? tables[0]?.name ?? null;
}

function toDashboardMetaTableName(tableName: string): string {
	const underscored = inflection.underscore(tableName);
	const singular = inflection.singularize(underscored);
	return inflection.camelize(singular);
}

const MemoizedDataGrid = memo(function MemoizedDataGrid({
	tableName,
	onRowSelect,
	onCellEdit,
}: {
	tableName: string;
	onRowSelect: (rows: any[]) => void;
	onCellEdit: (id: string | number, field: string, value: unknown) => void;
}) {
	return (
		<DataGridV2
			tableName={tableName}
			pageSize={50}
			infiniteScroll={true}
			onRowSelect={onRowSelect}
			onCellEdit={onCellEdit}
		/>
	);
});

function DashboardContent() {
	const pathname = usePathname();
	// Dashboard route: /orgs/[orgId]/databases/[databaseId]/data
	const isDashboardRoute = /^\/orgs\/[^/]+\/databases\/[^/]+\/data/.test(pathname);

	const {
		currentApi,
		noDatabaseSelected,
		noApisAvailable,
		servicesError,
		servicesLoading,
		refetchServices,
		isLoadingSchemas,
		schemasError,
	} = useDashboardContext();
	const { isAuthenticated } = useAuthContext();

	// Get database schema directly from URL params (already loaded by layout)
	// This bypasses Zustand selectedSchemaKey timing issues
	const { database: databaseSchema } = useEntityParams();

	// Create category lookup map from schema-builder data
	const categoryByTableName = useMemo(() => {
		const tables = databaseSchema?.dbSchema?.tables;
		if (!tables) return new Map<string, TableWithCategory['category']>();
		const map = new Map<string, TableWithCategory['category']>();
		for (const table of tables) {
			if (!table.category) continue;
			const candidates = new Set<string>([table.name, toDashboardMetaTableName(table.name)]);
			for (const key of candidates) {
				map.set(key, table.category);
			}
		}
		return map;
	}, [databaseSchema?.dbSchema?.tables]);

	const metaEnabled = Boolean(currentApi) && isAuthenticated;
	const {
		data: meta,
		isLoading: metaLoading,
		error: metaError,
		refetch: refetchMeta,
	} = useMeta({ enabled: metaEnabled });

	const [activeTable, setActiveTable] = useQueryState('table', parseAsString.withDefault(''));

	// Track if this is the initial table selection after auth/load
	// Used to trigger scroll-into-view behavior only on initial selection
	const hasInitializedTableRef = useRef(false);
	const shouldScrollToActiveRef = useRef(false);

	// Reset initialization tracking when meta is disabled (logged out, etc.)
	useEffect(() => {
		if (!metaEnabled) {
			hasInitializedTableRef.current = false;
			shouldScrollToActiveRef.current = false;
		}
	}, [metaEnabled]);

	useEffect(() => {
		if (!isDashboardRoute && activeTable) {
			setActiveTable(null);
		}
	}, [isDashboardRoute, activeTable, setActiveTable]);

	// Enrich tables with categories from schema-builder
	const tables = useMemo((): TableWithCategory[] => {
		const metaTables = meta?._meta?.tables;
		const result =
			metaTables
				?.filter((table) => table?.name)
				.map((table) => ({
					name: table!.name,
					category: categoryByTableName.get(table!.name),
				}))
				.sort((a, b) => {
					if (a.name === 'User') return -1;
					if (b.name === 'User') return 1;
					return a.name.localeCompare(b.name);
				}) || [];

		return result;
	}, [meta?._meta?.tables, categoryByTableName]);

	// Unified table selection logic:
	// 1. If URL has valid table -> use it, scroll into view on initial load
	// 2. If URL has invalid table -> default to first APP table
	// 3. If URL has no table -> default to first APP table
	//
	// IMPORTANT: We only modify the URL when we have tables loaded and can validate.
	// This preserves URL params during auth loading and meta fetching phases.
	useEffect(() => {
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
	}, [isDashboardRoute, metaEnabled, metaLoading, activeTable, tables, setActiveTable]);

	// Compute whether to scroll (consume the ref value)
	const shouldScrollToActive = shouldScrollToActiveRef.current;
	// Reset after render so subsequent selections don't trigger scroll
	useEffect(() => {
		if (shouldScrollToActiveRef.current) {
			// Use a small delay to ensure the scroll happens after render
			const timer = setTimeout(() => {
				shouldScrollToActiveRef.current = false;
			}, 100);
			return () => clearTimeout(timer);
		}
	}, [activeTable]);

	const handleRowSelect = useCallback((_rows: any[]) => {
		return;
	}, []);

	const handleCellEdit = useCallback((_id: string | number, _field: string, _value: unknown) => {
		return;
	}, []);

	// Create retry handler for errors
	const handleRetry = useCallback(() => {
		// Refetch services if there's a services error
		if (servicesError) {
			refetchServices();
		}
		// Refetch meta query if there's a meta error
		if (metaError) {
			refetchMeta();
		}
	}, [servicesError, metaError, refetchServices, refetchMeta]);

	// Determine current state using unified state helper
	const rawState = getDashboardState({
		noDatabaseSelected,
		noApisAvailable,
		schemasLoading: isLoadingSchemas,
		schemasError,
		servicesLoading,
		servicesError,
		metaLoading: metaEnabled && metaLoading,
		metaError: metaEnabled ? metaError : null,
		tablesCount: tables.length,
		activeTable,
	});

	// Add retry handler to error states
	const dashboardState: DashboardStateConfig | null = rawState
		? {
				...rawState,
				onRetry: rawState.type === 'error' ? handleRetry : undefined,
			}
		: null;

	// If there's a blocking state (no database, services error, no APIs), show it full-screen
	const isBlockingState = dashboardState && ['no-database', 'no-apis'].includes(dashboardState.type);
	const isErrorState = dashboardState?.type === 'error';

	// Show full-screen state for blocking conditions or any error
	if (isBlockingState || isErrorState) {
		return (
			<div data-part-id='dashboard-container' className='flex h-full flex-1 flex-col overflow-hidden'>
				<DashboardStateDisplay config={dashboardState!} />
			</div>
		);
	}

	// For other states (loading, no tables), show within the layout
	const showTableSidebar = !noDatabaseSelected && !noApisAvailable;
	const showDataGrid = activeTable && !dashboardState;
	const showContentState = dashboardState && !isBlockingState;

	return (
		<div data-part-id='dashboard-container' className='flex h-full flex-1 flex-col overflow-hidden'>
			<div data-part-id='dashboard-content' className='flex min-h-0 flex-1 overflow-hidden'>
				{/* Table sidebar */}
				{showTableSidebar && (
					<div
						data-part-id='dashboard-table-sidebar'
						className='border-border/60 bg-background ml-4 w-56 shrink-0 border-r'
					>
						<TableSelector
							tables={tables}
							activeTable={activeTable}
							onTableChange={setActiveTable}
							isLoading={metaEnabled && metaLoading}
							categoriesEnabled={categoryByTableName.size > 0}
							shouldScrollToActive={shouldScrollToActive}
						/>
					</div>
				)}

				{/* Main content area */}
				<div data-part-id='dashboard-main-grid-content' className='flex min-h-0 flex-1 flex-col overflow-hidden'>
					{/* State display (loading, no tables) */}
					{showContentState && <DashboardStateDisplay config={dashboardState} />}

					{/* Data grid or unselected table */}
					{!showContentState && (
						<div data-part-id='data-grid' className='flex min-h-0 flex-1 flex-col px-3 pb-3'>
							{showDataGrid ? (
								<MemoizedDataGrid tableName={activeTable} onRowSelect={handleRowSelect} onCellEdit={handleCellEdit} />
							) : (
								<DashboardUnselectedTable />
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export function DashboardRoute() {
	return (
		<QueryErrorBoundary
			onError={(error) => {
				console.error('Dashboard query error:', error.getLogDetails());
			}}
		>
			<DashboardContent />
		</QueryErrorBoundary>
	);
}
