import { useEffect, useMemo } from 'react';

import { useAppStore, useShallow } from '@/store/app-store';

import type { DataGridV2Filter } from '../data-grid.controls';
import { buildWhereFromFilters } from '../data-grid.utils';

// Data filtering context type
export interface DataFilteringContextValue {
	filters: DataGridV2Filter[];
	globalFilter: string;
	filtersOpen: boolean;
	effectiveWhere: any;
	hasActiveFilters: boolean;
	setFilters: (filters: DataGridV2Filter[]) => void;
	setGlobalFilter: (filter: string) => void;
	setFiltersOpen: (open: boolean) => void;
	addFilter: (firstColumn?: string) => void;
	removeFilter: (index: number) => void;
	updateFilter: (index: number, updates: Partial<DataGridV2Filter>) => void;
	clearAllFilters: () => void;
	applyFilters: () => void;
}

// Data filtering hook configuration
export interface UseDataFilteringConfig {
	columnKeys: string[];
	tableMeta?: any;
	initialFilters?: DataGridV2Filter[];
	initialGlobalFilter?: string;
}

// Main data filtering hook
export function useDataFiltering({
	columnKeys,
	tableMeta,
	initialFilters = [],
	initialGlobalFilter = '',
}: UseDataFilteringConfig) {
	const {
		filters,
		setFilters,
		globalFilter,
		setGlobalFilter,
		filtersOpen,
		setFiltersOpen,
		addFilter,
		removeFilter,
		updateFilter,
		clearAllFilters,
		applyFilters,
	} = useAppStore(
		useShallow((s) => ({
			filters: s.gridFilters,
			setFilters: s.setGridFilters,
			globalFilter: s.gridGlobalFilter,
			setGlobalFilter: s.setGridGlobalFilter,
			filtersOpen: s.gridFiltersOpen,
			setFiltersOpen: s.setGridFiltersOpen,
			addFilter: s.addGridFilter,
			removeFilter: s.removeGridFilter,
			updateFilter: s.updateGridFilter,
			clearAllFilters: s.clearAllGridFilters,
			applyFilters: s.applyGridFilters,
		})),
	);

	// Initialize defaults (run once per config change)
	useEffect(() => {
		if (initialFilters.length) setFilters(initialFilters);
		if (initialGlobalFilter) setGlobalFilter(initialGlobalFilter);
	}, [initialFilters, initialGlobalFilter, setFilters, setGlobalFilter]);

	// Compute effective where clause from current filters and global search
	const effectiveWhere = useMemo(
		() => buildWhereFromFilters(filters, globalFilter, tableMeta),
		[filters, globalFilter, tableMeta],
	);

	// Check if there are active filters
	const hasActiveFilters = useMemo(
		() => filters.some((f) => f.value !== '' && f.value !== null && f.value !== undefined) || globalFilter !== '',
		[filters, globalFilter],
	);

	// Ensure addFilter uses a meaningful default column
	const addFilterWithDefault = ((): ((firstColumn?: string) => void) => {
		return (firstColumn?: string) => {
			const firstCol = firstColumn || columnKeys.find((k) => k !== 'select');
			if (firstCol) addFilter(firstCol);
		};
	})();

	const contextValue: DataFilteringContextValue = useMemo(
		() => ({
			filters,
			globalFilter,
			filtersOpen,
			effectiveWhere,
			hasActiveFilters,
			setFilters,
			setGlobalFilter,
			setFiltersOpen,
			addFilter: addFilterWithDefault,
			removeFilter,
			updateFilter,
			clearAllFilters,
			applyFilters,
		}),
		[
			filters,
			globalFilter,
			filtersOpen,
			effectiveWhere,
			hasActiveFilters,
			setFilters,
			setGlobalFilter,
			setFiltersOpen,
			addFilterWithDefault,
			removeFilter,
			updateFilter,
			clearAllFilters,
			applyFilters,
		],
	);

	return {
		contextValue,
		Provider: ({ children }: { children: any }) => children,
	};
}

// Convenience hooks for accessing specific parts of the context
export function useFilterState() {
	const filters = useAppStore((s) => s.gridFilters);
	const globalFilter = useAppStore((s) => s.gridGlobalFilter);
	const filtersOpen = useAppStore((s) => s.gridFiltersOpen);
	const effectiveWhere = useMemo(
		() => buildWhereFromFilters(filters, globalFilter, undefined),
		[filters, globalFilter],
	);
	const hasActiveFilters = useMemo(
		() => filters.some((f) => f.value !== '' && f.value !== null && f.value !== undefined) || globalFilter !== '',
		[filters, globalFilter],
	);
	return { filters, globalFilter, filtersOpen, effectiveWhere, hasActiveFilters };
}

export function useFilterActions() {
	return useAppStore(
		useShallow((s) => ({
			setFilters: s.setGridFilters,
			setGlobalFilter: s.setGridGlobalFilter,
			setFiltersOpen: s.setGridFiltersOpen,
			addFilter: s.addGridFilter,
			removeFilter: s.removeGridFilter,
			updateFilter: s.updateGridFilter,
			clearAllFilters: s.clearAllGridFilters,
			applyFilters: s.applyGridFilters,
		})),
	);
}
