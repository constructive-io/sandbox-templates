// Generic Cell Types for Frontend Rendering
// Backend-agnostic types that focus only on how data should be displayed and edited

export type CellType =
	// Text-based cells
	| 'text'
	| 'textarea'
	| 'email'
	| 'url'
	| 'phone'
	| 'citext' // Case-insensitive text
	| 'bpchar' // Blank-padded character
	// Numeric cells
	| 'number'
	| 'integer'
	| 'smallint' // Small integer
	| 'decimal'
	| 'currency'
	| 'percentage'
	// Date/time cells
	| 'date'
	| 'datetime'
	| 'time'
	| 'timestamptz' // Timestamp with timezone
	| 'interval'
	// Boolean cells
	| 'boolean'
	| 'toggle'
	| 'bit' // Binary digit
	// Structured data cells
	| 'json'
	| 'jsonb' // Binary JSON
	| 'array'
	// Array cells (specific types)
	| 'text-array'
	| 'uuid-array'
	| 'number-array'
	| 'integer-array'
	| 'date-array'
	// Geometric cells
	| 'geometry' // Generic geometry
	| 'geometry-point'
	| 'geometry-collection'
	// Network cells
	| 'inet' // IP address
	// Media cells
	| 'image'
	| 'file'
	| 'video'
	| 'audio'
	| 'upload' // Custom upload type
	// Special cells
	| 'uuid'
	| 'color'
	| 'rating'
	| 'tags'
	| 'tsvector'
	| 'origin' // Custom origin type
	// Relation cells
	| 'relation' // Related table records
	// Fallback
	| 'unknown';

// Categories for organizing cell types
export type CellCategory =
	| 'text'
	| 'numeric'
	| 'date'
	| 'boolean'
	| 'structured'
	| 'geometric'
	| 'network' // Added network category
	| 'media'
	| 'special'
	| 'other';

// Data types for runtime values (backend-agnostic)
export type CellValue = string | number | boolean | Date | null | undefined | Array<any> | Record<string, any>;

// Field metadata from GraphQL _meta query
export interface FieldMetadata {
	name: string;
	gqlType: string;
	isArray: boolean;
	modifier?: string | number | null;
	pgAlias?: string | null;
	pgType?: string | null;
	subtype?: string | null;
	typmod?: number | null;
}

// Column schema for frontend use
export interface ColumnSchema {
	id: string;
	name: string;
	type: CellType;
	nullable: boolean;
	metadata?: {
		label?: string;
		description?: string;
		hidden?: boolean;
		readonly?: boolean;
		sortable?: boolean;
		filterable?: boolean;
		isArray?: boolean;
		// Text field specific metadata
		placeholder?: string;
		maxLength?: number;
		minLength?: number;
		// Additional field metadata
		pattern?: string;
		rows?: number;
		required?: boolean;
	};
}

// Table schema definition
export interface TableSchema {
	id: string;
	name: string;
	columns: ColumnSchema[];
	metadata?: {
		label?: string;
		description?: string;
		primaryKey?: string[];
		indexes?: Array<{
			columns: string[];
			unique?: boolean;
		}>;
	};
}

// Row data structure
export interface RowData {
	id: string;
	[columnId: string]: CellValue;
}
