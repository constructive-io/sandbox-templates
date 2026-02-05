import { ComponentType } from 'react';

import { CellCategory, CellType, CellValue, ColumnSchema } from '@/lib/types/cell-types';

// Base cell component props
export interface BaseCellProps {
	value: CellValue;
	column: ColumnSchema;
	rowId: string;
	isEditing?: boolean;
	onChange?: (value: CellValue) => void;
	onStartEdit?: () => void;
	onSave?: () => void;
	onCancel?: () => void;
	className?: string;
	disabled?: boolean;
}

// Cell component with editing state
export interface EditableCellProps extends BaseCellProps {
	editingValue?: CellValue;
	onEditingValueChange?: (value: CellValue) => void;
}

// Cell renderer component type
export type CellRenderer = ComponentType<BaseCellProps>;

// Cell registry entry
export interface CellRegistryEntry {
	type: CellType;
	component: CellRenderer;
	editComponent?: CellRenderer;
	validator?: (value: CellValue) => boolean;
	formatter?: (value: CellValue) => string;
	parser?: (input: string) => CellValue;
	defaultValue?: () => CellValue;
	// Optional match function for advanced cell type detection
	match?: (metadata: {
		gqlType: string;
		isArray: boolean;
		pgAlias?: string | null;
		pgType?: string | null;
		subtype?: string | null;
		fieldName?: string;
		value?: any;
	}) => boolean;
	metadata?: {
		name: string;
		description: string;
		category: CellCategory;
		supportsInlineEdit?: boolean;
		supportsSort?: boolean;
		supportsFilter?: boolean;
		// Styling metadata
		width?: number; // Recommended width for the cell
	};
}

// Plugin interface for custom cells
export interface CellPlugin {
	name: string;
	version: string;
	cells: CellRegistryEntry[];
	install?: () => void;
	uninstall?: () => void;
}

// Cell context for advanced features
export interface CellContext {
	tenantId: string;
	tableId: string;
	rowData: Record<string, CellValue>;
	permissions: {
		read: boolean;
		write: boolean;
	};
}
