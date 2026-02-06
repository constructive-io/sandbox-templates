export { getSidebarConfig, type NavigationLevel, type SidebarConfigOptions } from './sidebar-config';
export { useSidebarNavigation, type UseSidebarNavigationOptions, type UseSidebarNavigationResult } from './use-sidebar-navigation';

// URL-based entity state management
export {
	useEntityParams,
	type Organization,
	type OrgRole,
	type EntityValidation,
	type UseEntityParamsResult,
} from './use-entity-params';

export {
	findDatabaseSchemaByDatabaseId,
	getSchemaKeyFromDatabaseId,
	getDatabaseIdFromSchemaKey,
	type DatabaseSchemaMatchOptions,
} from './database-schema-mapping';

export {
	DATABASE_SECTION_ROUTE_KEYS,
	getDatabaseRouteKeyFromSection,
	getDatabaseSectionFromPathname,
	type DatabaseSection,
} from './database-route-section';

// nuqs-based URL state hooks
export {
	useTableSelection,
	useTabState,
	usePaginationState,
	useSearchState,
	useSortState,
	useSelectionState,
	useTableViewState,
	useViewModeState,
	useFieldSelection,
	useFilterState,
	type PaginationState,
	type SortState,
	type TableViewState,
} from './use-url-state';
