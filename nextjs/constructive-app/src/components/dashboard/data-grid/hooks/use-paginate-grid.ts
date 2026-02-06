import { useCallback, useEffect, useMemo } from 'react';

import { useAppStore, useShallow } from '@/store/app-store';

// Data pagination context type
export interface DataPaginationContextValue {
	// Pagination state
	pageIndex: number;
	pageSize: number;
	totalCount: number;
	totalPages: number;

	// Computed values
	hasNextPage: boolean;
	hasPreviousPage: boolean;
	startIndex: number;
	endIndex: number;

	// Actions
	setPageIndex: (index: number) => void;
	setPageSize: (size: number) => void;
	goToNextPage: () => void;
	goToPreviousPage: () => void;
	goToFirstPage: () => void;
	goToLastPage: () => void;
}

// Create context
// Legacy context removed; hooks now consume Zustand store

// Data pagination hook configuration
export interface UseDataPaginationConfig {
	initialPageSize?: number;
	initialPageIndex?: number;
	totalCount?: number;
	onPageChange?: (pageIndex: number, pageSize: number) => void;
}

// Main data pagination hook
export function useDataPagination({
	initialPageSize = 100,
	initialPageIndex = 0,
	totalCount = 0,
	onPageChange,
}: UseDataPaginationConfig) {
	const { pageIndex, pageSize, setPageIndexState, setPageSizeState } = useAppStore(
		useShallow((s) => ({
			pageIndex: s.gridPageIndex,
			pageSize: s.gridPageSize,
			setPageIndexState: s.setGridPageIndex,
			setPageSizeState: s.setGridPageSize,
		})),
	);

	// Compute pagination values
	const totalPages = useMemo(() => Math.max(1, Math.ceil(totalCount / pageSize)), [totalCount, pageSize]);
	const hasNextPage = useMemo(() => pageIndex < totalPages - 1, [pageIndex, totalPages]);
	const hasPreviousPage = useMemo(() => pageIndex > 0, [pageIndex]);
	const startIndex = useMemo(() => pageIndex * pageSize + 1, [pageIndex, pageSize]);
	const endIndex = useMemo(() => Math.min((pageIndex + 1) * pageSize, totalCount), [pageIndex, pageSize, totalCount]);

	useEffect(() => {
		if (pageSize !== initialPageSize) {
			setPageSizeState(initialPageSize);
		}
	}, [initialPageSize, pageSize, setPageSizeState]);

	useEffect(() => {
		if (pageIndex !== initialPageIndex) {
			setPageIndexState(initialPageIndex);
		}
	}, [initialPageIndex, pageIndex, setPageIndexState]);

	// Auto-adjust page index when total pages changes
	useEffect(() => {
		if (pageIndex >= totalPages && totalPages > 0) {
			setPageIndexState(Math.max(0, totalPages - 1));
		}
	}, [pageIndex, totalPages, setPageIndexState]);

	// Page index setter with callback
	const setPageIndex = useCallback(
		(index: number) => {
			const clampedIndex = Math.max(0, Math.min(index, totalPages - 1));
			setPageIndexState(clampedIndex);
			onPageChange?.(clampedIndex, pageSize);
		},
		[totalPages, pageSize, onPageChange, setPageIndexState],
	);

	// Page size setter with callback and reset to first page
	const setPageSize = useCallback(
		(size: number) => {
			setPageSizeState(size);
			setPageIndexState(0); // Reset to first page when changing page size
			onPageChange?.(0, size);
		},
		[onPageChange, setPageIndexState, setPageSizeState],
	);

	// Navigation actions
	const goToNextPage = useCallback(() => {
		if (hasNextPage) {
			setPageIndex(pageIndex + 1);
		}
	}, [hasNextPage, pageIndex, setPageIndex]);

	const goToPreviousPage = useCallback(() => {
		if (hasPreviousPage) {
			setPageIndex(pageIndex - 1);
		}
	}, [hasPreviousPage, pageIndex, setPageIndex]);

	const goToFirstPage = useCallback(() => {
		setPageIndex(0);
	}, [setPageIndex]);

	const goToLastPage = useCallback(() => {
		setPageIndex(totalPages - 1);
	}, [totalPages, setPageIndex]);

	const contextValue: DataPaginationContextValue = useMemo(
		() => ({
			pageIndex,
			pageSize,
			totalCount,
			totalPages,
			hasNextPage,
			hasPreviousPage,
			startIndex,
			endIndex,
			setPageIndex,
			setPageSize,
			goToNextPage,
			goToPreviousPage,
			goToFirstPage,
			goToLastPage,
		}),
		[
			pageIndex,
			pageSize,
			totalCount,
			totalPages,
			hasNextPage,
			hasPreviousPage,
			startIndex,
			endIndex,
			setPageIndex,
			setPageSize,
			goToNextPage,
			goToPreviousPage,
			goToFirstPage,
			goToLastPage,
		],
	);

	return {
		contextValue,
		Provider: ({ children }: { children: any }) => children,
	};
}

// Convenience hooks for accessing specific parts of the context
export function usePaginationState() {
	const pageIndex = useAppStore((s) => s.gridPageIndex);
	const pageSize = useAppStore((s) => s.gridPageSize);
	return { pageIndex, pageSize } as any;
}

export function usePaginationActions() {
	return useAppStore(
		useShallow((s) => ({
			setPageIndex: s.setGridPageIndex,
			setPageSize: s.setGridPageSize,
			goToNextPage: () => s.setGridPageIndex(s.gridPageIndex + 1),
			goToPreviousPage: () => s.setGridPageIndex(Math.max(0, s.gridPageIndex - 1)),
			goToFirstPage: () => s.setGridPageIndex(0),
			goToLastPage: () => {},
		})),
	);
}
