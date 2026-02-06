import { useCallback, useMemo, useReducer } from 'react';
import type { GridSelection } from '@glideapps/glide-data-grid';

// Centralized grid state interface
export interface GridState {
	// Sorting state
	sorting: {
		id: string | null;
		desc: boolean;
	};

	// Pagination state
	pageIndex: number;

	// Filter states
	filters: Array<{ id: string; value: string }>;
	globalFilter: string;
	filtersOpen: boolean;

	// Column state
	columnWidths: Map<string, number>;

	// Selection state
	gridSelection: GridSelection | undefined;

	// Relation columns state
	enabledRelations: string[];
}

// Action types for state updates
export type GridAction =
	| { type: 'SET_SORTING'; payload: GridState['sorting'] }
	| { type: 'TOGGLE_SORTING'; payload: string }
	| { type: 'SET_PAGE_INDEX'; payload: number }
	| { type: 'SET_FILTERS'; payload: GridState['filters'] }
	| { type: 'ADD_FILTER'; payload: string }
	| { type: 'CLEAR_ALL_FILTERS' }
	| { type: 'SET_GLOBAL_FILTER'; payload: string }
	| { type: 'TOGGLE_FILTERS_PANEL' }
	| { type: 'SET_FILTERS_OPEN'; payload: boolean }
	| { type: 'RESIZE_COLUMN'; payload: { id: string; width: number } }
	| { type: 'SET_GRID_SELECTION'; payload: GridSelection | undefined }
	| { type: 'RESET_PAGE_IF_NEEDED'; payload: { totalPages: number } }
	| { type: 'SET_ENABLED_RELATIONS'; payload: string[] };

// Initial state factory
function createInitialGridState(): GridState {
	return {
		sorting: { id: null, desc: false },
		pageIndex: 0,
		filters: [],
		globalFilter: '',
		filtersOpen: false,
		columnWidths: new Map(),
		gridSelection: undefined,
		enabledRelations: [],
	};
}

// State reducer with type-safe action handling
function gridStateReducer(state: GridState, action: GridAction): GridState {
	switch (action.type) {
		case 'SET_SORTING':
			return {
				...state,
				sorting: action.payload,
			};

		case 'TOGGLE_SORTING': {
			const colId = action.payload;
			let newSorting: GridState['sorting'];

			if (state.sorting.id !== colId) {
				// Different column clicked: start with ASC
				newSorting = { id: colId, desc: false };
			} else if (!state.sorting.desc) {
				// Same column, currently ASC: switch to DESC
				newSorting = { id: colId, desc: true };
			} else {
				// Same column, currently DESC: reset to neutral (no sorting)
				newSorting = { id: null, desc: false };
			}

			return {
				...state,
				sorting: newSorting,
			};
		}

		case 'SET_PAGE_INDEX':
			return {
				...state,
				pageIndex: action.payload,
			};

		case 'SET_FILTERS':
			return {
				...state,
				filters: action.payload,
			};

		case 'ADD_FILTER': {
			const firstCol = action.payload;
			if (firstCol) {
				return {
					...state,
					filters: [...state.filters, { id: firstCol, value: '' }],
				};
			}
			return state;
		}

		case 'CLEAR_ALL_FILTERS':
			return {
				...state,
				filters: [],
				globalFilter: '',
			};

		case 'SET_GLOBAL_FILTER':
			return {
				...state,
				globalFilter: action.payload,
			};

		case 'TOGGLE_FILTERS_PANEL':
			return {
				...state,
				filtersOpen: !state.filtersOpen,
			};

		case 'SET_FILTERS_OPEN':
			return {
				...state,
				filtersOpen: action.payload,
			};

		case 'RESIZE_COLUMN': {
			const newColumnWidths = new Map(state.columnWidths);
			newColumnWidths.set(action.payload.id, action.payload.width);
			return {
				...state,
				columnWidths: newColumnWidths,
			};
		}

		case 'SET_GRID_SELECTION':
			return {
				...state,
				gridSelection: action.payload,
			};

		case 'SET_ENABLED_RELATIONS':
			return {
				...state,
				enabledRelations: action.payload,
			};

		case 'RESET_PAGE_IF_NEEDED': {
			const { totalPages } = action.payload;
			if (state.pageIndex >= totalPages) {
				return {
					...state,
					pageIndex: Math.max(0, totalPages - 1),
				};
			}
			return state;
		}

		default:
			return state;
	}
}

// Custom hook for grid state management
export function useGridState() {
	const [state, dispatch] = useReducer(gridStateReducer, undefined, createInitialGridState);

	const setSorting = useCallback((sorting: GridState['sorting']) => {
		dispatch({ type: 'SET_SORTING', payload: sorting });
	}, []);

	const toggleSorting = useCallback((colId: string) => {
		dispatch({ type: 'TOGGLE_SORTING', payload: colId });
	}, []);

	const setPageIndex = useCallback((pageIndex: number) => {
		dispatch({ type: 'SET_PAGE_INDEX', payload: pageIndex });
	}, []);

	const setFilters = useCallback((filters: GridState['filters']) => {
		dispatch({ type: 'SET_FILTERS', payload: filters });
	}, []);

	const addFilter = useCallback((colId: string) => {
		dispatch({ type: 'ADD_FILTER', payload: colId });
	}, []);

	const clearAllFilters = useCallback(() => {
		dispatch({ type: 'CLEAR_ALL_FILTERS' });
	}, []);

	const setGlobalFilter = useCallback((filter: string) => {
		dispatch({ type: 'SET_GLOBAL_FILTER', payload: filter });
	}, []);

	const toggleFiltersPanel = useCallback(() => {
		dispatch({ type: 'TOGGLE_FILTERS_PANEL' });
	}, []);

	const setFiltersOpen = useCallback((open: boolean) => {
		dispatch({ type: 'SET_FILTERS_OPEN', payload: open });
	}, []);

	const resizeColumn = useCallback((id: string, width: number) => {
		dispatch({ type: 'RESIZE_COLUMN', payload: { id, width } });
	}, []);

	const setGridSelection = useCallback((selection: GridSelection | undefined) => {
		dispatch({ type: 'SET_GRID_SELECTION', payload: selection });
	}, []);

	const setEnabledRelations = useCallback((relations: string[]) => {
		dispatch({ type: 'SET_ENABLED_RELATIONS', payload: relations });
	}, []);

	const resetPageIfNeeded = useCallback((totalPages: number) => {
		dispatch({ type: 'RESET_PAGE_IF_NEEDED', payload: { totalPages } });
	}, []);

	// Stable object identity (avoid prop/effect churn in consumers)
	const actions = useMemo(
		() => ({
			setSorting,
			toggleSorting,
			setPageIndex,
			setFilters,
			addFilter,
			clearAllFilters,
			setGlobalFilter,
			toggleFiltersPanel,
			setFiltersOpen,
			resizeColumn,
			setGridSelection,
			setEnabledRelations,
			resetPageIfNeeded,
		}),
		[
			setSorting,
			toggleSorting,
			setPageIndex,
			setFilters,
			addFilter,
			clearAllFilters,
			setGlobalFilter,
			toggleFiltersPanel,
			setFiltersOpen,
			resizeColumn,
			setGridSelection,
			setEnabledRelations,
			resetPageIfNeeded,
		],
	);

	return {
		state,
		actions,
	};
}
