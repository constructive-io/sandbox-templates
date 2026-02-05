import type { LucideIcon } from 'lucide-react';

import type { NodeTypeRegistry } from '@sdk/app-public';

// ============================================================================
// CRUD OPERATIONS TYPES
// ============================================================================

/**
 * CRUD operation type
 */
export type CrudOperation = 'create' | 'read' | 'update' | 'delete';

/**
 * Mapping from CRUD operations to SQL privileges
 */
export const CRUD_TO_PRIVILEGE: Record<CrudOperation, string> = {
	create: 'INSERT',
	read: 'SELECT',
	update: 'UPDATE',
	delete: 'DELETE',
};

/**
 * All CRUD operations in display order
 */
export const CRUD_OPERATIONS: CrudOperation[] = ['create', 'read', 'update', 'delete'];

/**
 * Human-readable labels for CRUD operations
 */
export const OPERATION_LABELS: Record<CrudOperation, string> = {
	create: 'CREATE',
	read: 'READ',
	update: 'UPDATE',
	delete: 'DELETE',
};

/**
 * Descriptions for each CRUD operation
 */
export const OPERATION_DESCRIPTIONS: Record<CrudOperation, string> = {
	create: 'Insert new records into the table',
	read: 'Retrieve records from the table',
	update: 'Modify existing records',
	delete: 'Remove records from the table',
};

/**
 * Style configuration for each CRUD operation (icon imported separately)
 */
export interface OperationStyle {
	bgClass: string;
	textClass: string;
	iconName: 'Plus' | 'Search' | 'Pencil' | 'Trash2';
}

export const OPERATION_STYLES: Record<CrudOperation, OperationStyle> = {
	create: { bgClass: 'bg-gradient-to-r from-emerald-500/15 to-emerald-400/10 ring-1 ring-emerald-500/30', textClass: 'text-emerald-600 dark:text-emerald-400', iconName: 'Plus' },
	read: { bgClass: 'bg-gradient-to-r from-sky-500/15 to-sky-400/10 ring-1 ring-sky-500/30', textClass: 'text-sky-600 dark:text-sky-400', iconName: 'Search' },
	update: { bgClass: 'bg-gradient-to-r from-amber-500/15 to-amber-400/10 ring-1 ring-amber-500/30', textClass: 'text-amber-600 dark:text-amber-400', iconName: 'Pencil' },
	delete: { bgClass: 'bg-gradient-to-r from-rose-500/15 to-rose-400/10 ring-1 ring-rose-500/30', textClass: 'text-rose-600 dark:text-rose-400', iconName: 'Trash2' },
};

/**
 * Optional hints for specific operations
 */
export const OPERATION_HINTS: Partial<Record<CrudOperation, string>> = {
	read: 'Hint: Many apps allow more visibility than write access. Consider a public read policy if appropriate.',
};

/**
 * Per-operation policy configuration
 */
export interface OperationPolicyConfig {
	roleName: string;
	isPermissive: boolean;
	/** Policy type specific data (e.g., owner_id field selection) */
	policyData: Record<string, unknown>;
	/** Whether user has customized this operation from defaults */
	isCustomized: boolean;
}

/**
 * Default policy configuration that all operations inherit from
 */
export interface DefaultPolicyConfig {
	roleName: string;
	isPermissive: boolean;
	/** Policy type specific data (e.g., owner_id field selection) */
	policyData: Record<string, unknown>;
}

/**
 * All 4 CRUD operation configs
 */
export interface CrudPolicyConfigs {
	create: OperationPolicyConfig;
	read: OperationPolicyConfig;
	update: OperationPolicyConfig;
	delete: OperationPolicyConfig;
}

/**
 * Input for creating a table with 4 CRUD policies
 */
export interface CreateTableWithPoliciesInput {
	databaseId: string;
	schemaId: string;
	privateSchemaId?: string;
	tableName: string;
	policyType: string;
	tableModuleType?: string;
	tableModuleData?: Record<string, unknown>;
	/**
	 * Shared policy data that applies to all operations.
	 * Contains field references, table references, and structural params.
	 * Per-op params (permission, is_admin, is_owner) are taken from each operation.
	 */
	sharedPolicyData: Record<string, unknown>;
	/** Per-operation configs (roleName, isPermissive, per-op policyData like permission) */
	operations: CrudPolicyConfigs;
	/** Custom field names for Category B policies (key -> field name) */
	fieldNameOverrides?: Record<string, string>;
}

// ============================================================================
// POLICY TYPE CONFIGURATION
// ============================================================================

/**
 * Field override for customizing how a policy parameter is displayed in the form.
 * For 'needs-fields' category policies, set pgType to indicate a database column should be created.
 */
export interface FieldOverride {
	label?: string;
	placeholder?: string;
	description?: string;
	defaultValue?: unknown;
	/** Hide this field from the form (it will still use defaultValue if provided) */
	hidden?: boolean;
	/** PostgreSQL type - if set, a column will be created for this field */
	pgType?: 'uuid' | 'uuid[]' | 'timestamptz' | 'boolean';
	/** If true, this field can vary per CRUD operation (e.g., permission, is_admin) */
	perOperation?: boolean;
}

/**
 * Policy category based on POLICY_SYSTEM_REFERENCE.md
 *
 * - 'has-module': Has table module that auto-creates fields (e.g., DataDirectOwner)
 * - 'needs-fields': Needs explicit field creation before policy
 * - 'needs-table': Needs a related table for join-based access
 * - 'no-fields': No fields needed, just creates policy
 */
export type PolicyCategory = 'has-module' | 'needs-fields' | 'needs-table' | 'no-fields';

/**
 * UI configuration for a policy type - this is the single source of truth
 * for how each policy type is displayed in the wizard
 */
export interface PolicyTypeUIConfig {
	/** Override backend's displayName */
	title?: string;
	/** Short tagline for cards */
	tagline: string;
	/** Icon component */
	icon: LucideIcon;
	/** Policy category (A=table module, B=needs fields, C=needs table, D=no fields) */
	category: PolicyCategory;
	/** Whether this policy type uses a table module to auto-generate fields */
	hasTableModule: boolean;
	/** The Data* module type (e.g., 'DataDirectOwner') */
	tableModuleType?: string;
	/** Form field customizations (fields with pgType will create database columns) */
	fieldOverrides?: Record<string, FieldOverride>;
	/** Field keys to show in advanced section */
	advancedFields?: string[];
	/** Key to select diagram component */
	diagramKey?: string;
	/** Display order in selector (lower = first) */
	sortOrder: number;
}

/**
 * Generated field that will be auto-created by a table module
 */
export interface GeneratedField {
	name: string;
	type: string;
	nullable: boolean;
	description: string;
}

/**
 * Content for the "Know More" card - user-friendly descriptions and use cases
 */
export interface PolicyKnowMoreContent {
	/** Main description paragraph explaining the policy in plain terms */
	vibeCheck: string;
	/** Security benefits/features of this policy */
	securityFeatures: string[];
	/** Use cases - what this policy is perfect for building */
	useCases: string[];
}

/**
 * Merged policy type combining backend registry data with UI config
 */
export interface MergedPolicyType {
	// Backend data
	name: string;
	slug: string;
	parameterSchema: unknown;
	tags: string[] | null;
	// Merged UI config (UI overrides backend)
	title: string;
	description: string;
	tagline: string;
	icon: LucideIcon;
	category: PolicyCategory;
	hasTableModule: boolean;
	tableModuleType?: string;
	generatedFields: GeneratedField[];
	fieldOverrides?: Record<string, FieldOverride>;
	advancedFields?: string[];
	diagramKey?: string;
	sortOrder: number;
}

/**
 * Form field schema derived from parameterSchema + overrides
 */
export type FormFieldType =
	| 'text'
	| 'field-select'
	| 'field-multi-select'
	| 'table-select'
	| 'membership-type-select'
	| 'permission-select'
	| 'boolean'
	| 'number';

export interface FormFieldSchema {
	key: string;
	type: FormFieldType;
	label: string;
	description?: string;
	placeholder?: string;
	required: boolean;
	defaultValue?: unknown;
	dependsOn?: string;
}

/**
 * Input for creating a table with policy
 */
export interface CreateTableWithPolicyInput {
	databaseId: string;
	schemaId: string;
	privateSchemaId?: string;
	tableName: string;
	policyType: string;
	policyName: string;
	policyData: Record<string, unknown>;
	tableModuleType?: string;
	tableModuleData?: Record<string, unknown>;
	// Single policy settings
	privilege: string;
	roleName: string;
	isPermissive: boolean;
	isEnabled: boolean;
}

/**
 * Creation step state for tracking progress
 */
export type CreationStep =
	| 'idle'
	| 'creating-table'
	| 'creating-table-module'
	| 'creating-fields'
	| 'creating-policies'
	| 'done'
	| 'error';

/**
 * Result of table with policy creation
 */
export interface CreateTableWithPolicyResult {
	tableId: string;
	tableName: string;
	tableModuleId?: string;
	policyIds: string[];
}

/**
 * Raw node type registry entry
 */
export type NodeTypeRegistryEntry = NodeTypeRegistry;
