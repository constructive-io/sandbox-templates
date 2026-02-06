// Main exports for the data grid component
export { DataGridV2 } from './data-grid';

// Export component prop types
export type { DataGridProps as DataGridV2Props } from './data-grid.types';

// Export context hooks for advanced usage
export {
	useDataLoading,
	useTableData,
	useTableOperations,
	useTableMeta,
	type DataLoadingContextValue,
} from './hooks/use-load-grid';

export {
	useDataFiltering,
	useFilterState,
	useFilterActions,
	type DataFilteringContextValue,
} from './hooks/use-filter-grid';

export {
	useDataPagination,
	usePaginationState,
	usePaginationActions,
	type DataPaginationContextValue,
} from './hooks/use-paginate-grid';

// Export utility functions for external usage
export { createCellContent } from './cell-content-factory';
export {
	handleCellEdit,
	handleCellActivation,
	handleRowAppend,
	createHeaderClickHandler,
	createColumnResizeHandler,
	buildWhereFromFilters,
	inferCellTypeFromData,
	formatArrayPreview,
	formatGeometryPreview,
	type CellEditResult,
} from './data-grid.utils';

// Export sub-components
export { DataGridV2Controls } from './data-grid.controls';
export { DataGridV2Pagination } from './data-grid.pagination';
