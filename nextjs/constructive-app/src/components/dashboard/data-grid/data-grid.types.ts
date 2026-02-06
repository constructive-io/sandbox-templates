import type { CSSProperties, RefObject } from 'react';
import type { ColumnDef, ColumnPinningState, PaginationState, Table } from '@tanstack/react-table';
import type { VirtualItem } from '@tanstack/react-virtual';

export interface DataGridRow {
	id: string;
	[key: string]: any;
}

export interface DataGridColumnMeta {
	fieldName: string;
	fieldType: {
		gqlType: string;
		pgType?: string | null;
		pgAlias?: string | null;
	};
}

export interface DataGridProps {
	tableName: string;
	className?: string;
	pageSize?: number;
	showSelection?: boolean;
	showSearch?: boolean;
	showFilters?: boolean;
	showPagination?: boolean;
	onRowSelect?: (selectedRows: any[]) => void;
	onCellEdit?: (id: string | number, field: string, value: unknown) => void;
	// Relation rendering options
	relationChipLimit?: number;
	relationLabelMaxLength?: number;
	/**
	 * Enable infinite scroll mode with cursor-based pagination.
	 * When enabled:
	 * - Rows are loaded on-demand as user scrolls
	 * - Traditional pagination UI is hidden
	 * - Uses hybrid cursor/offset pagination for optimal performance
	 * @default false
	 */
	infiniteScroll?: boolean;
}

export interface DataGridContextType {
	// Refs
	scrollRef: RefObject<HTMLDivElement | null>;

	// Data
	rows: DataGridRow[];
	columns: ColumnDef<DataGridRow>[];
	tableName: string;

	// Table instance
	table: Table<DataGridRow>;

	// Virtualization
	virtualRows: VirtualItem[];
	tableHeight: number;

	// Loading/error states
	isLoading: boolean;
	error: Error | null;

	// Pagination state
	pagination: PaginationState;

	// Column pinning state
	columnPinning: ColumnPinningState;

	// Relation columns state
	enabledRelations: string[];
	setEnabledRelations: (relations: string[]) => void;

	// Callbacks
	onCellEdit?: (id: string | number, field: string, value: unknown) => void;
	broadcastChanges: () => void;
	refetchData: () => Promise<void>;

	// Computed values
	totalColumnsWidth: number;
	containerBounds: { width?: number; height?: number } | null;
	totalCount: number;

	// Ref setter for scroll container
	setScrollContainer: (node: HTMLDivElement | null) => void;
}

export interface TableCellProps {
	rowIndex: number;
	columnIndex: number;
	virtualRow: VirtualItem;
	virtualColumn: VirtualItem;
	style?: CSSProperties;
}

export interface TableHeaderCellProps {
	columnIndex: number;
	virtualColumn: VirtualItem;
	style?: CSSProperties;
}
