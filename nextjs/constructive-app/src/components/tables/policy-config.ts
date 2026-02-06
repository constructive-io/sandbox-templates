import { Clock, Eye, Globe, Layers, Link, Lock, Network, Shield, Unlock, User, UserCheck, Users } from 'lucide-react';

import type { FieldOverride, GeneratedField, MergedPolicyType, PolicyCategory, PolicyTypeUIConfig } from './policy-types';

/**
 * Check if a field key is a per-operation parameter for the given policy type.
 * Per-operation params can vary between CRUD operations.
 * Shared params (field refs, table refs, structural) must be the same across all operations.
 */
export function isPerOperationField(policyType: string, key: string): boolean {
	return POLICY_TYPE_UI_CONFIG[policyType]?.fieldOverrides?.[key]?.perOperation === true;
}

/**
 * Merge policy data for a single operation.
 * - Shared params (field refs, table refs, structural) come from defaults
 * - Per-op params (those with perOperation: true) come from operation config
 */
export function mergeOperationPolicyData(
	policyType: string,
	sharedPolicyData: Record<string, unknown>,
	operationPolicyData: Record<string, unknown>,
): Record<string, unknown> {
	const merged = { ...sharedPolicyData };
	const fieldOverrides = POLICY_TYPE_UI_CONFIG[policyType]?.fieldOverrides;

	if (fieldOverrides) {
		for (const [key, override] of Object.entries(fieldOverrides)) {
			if (override.perOperation && key in operationPolicyData) {
				merged[key] = operationPolicyData[key];
			}
		}
	}

	return merged;
}

// ============================================================================
// POLICY TYPE UI CONFIG
// ============================================================================

/**
 * SINGLE SOURCE OF TRUTH for policy type UI configuration.
 *
 * This config is merged with backend registry data to produce the final
 * policy type definitions used in the wizard.
 *
 * Policy types NOT in this config will not appear in the wizard.
 *
 * For authz nodes with corresponding data nodes that support custom field names,
 * those field customizations should be in advancedFields.
 */
export const POLICY_TYPE_UI_CONFIG: Record<string, PolicyTypeUIConfig> = {
	// === OWNERSHIP PATTERNS ===

	AuthzDirectOwner: {
		title: 'Direct Ownership',
		tagline: 'Users access their own records',
		icon: User,
		category: 'has-module',
		hasTableModule: true,
		tableModuleType: 'DataDirectOwner',
		fieldOverrides: {
			entity_field: {
				label: 'Owner Field Name',
				placeholder: 'owner_id',
				description: 'Column that stores the owner user ID',
				defaultValue: 'owner_id',
			},
		},
		// DataDirectOwner supports custom field name via owner_field_name
		advancedFields: ['entity_field'],
		diagramKey: 'direct-owner',
		sortOrder: 1,
	},

	AuthzDirectOwnerAny: {
		title: 'Multi-Owner Access',
		tagline: 'Multiple owner fields (OR logic)',
		icon: Users,
		category: 'needs-fields',
		hasTableModule: false,
		fieldOverrides: {
			entity_fields: {
				label: 'Owner Fields',
				description: 'Array of column names to check for ownership',
				defaultValue: 'owner_ids',
				pgType: 'uuid[]',
			},
		},
		diagramKey: 'direct-owner-any',
		sortOrder: 2,
	},

	AuthzMemberList: {
		title: 'Member List',
		tagline: 'User ID stored in a list column',
		icon: Users,
		category: 'needs-fields',
		hasTableModule: false,
		fieldOverrides: {
			array_field: {
				label: 'Member List Field',
				placeholder: 'allowed_users',
				description: 'Column containing list of user IDs',
				defaultValue: 'allowed_users',
				pgType: 'uuid[]',
			},
		},
		diagramKey: 'array-contains-actor',
		sortOrder: 3,
	},

	AuthzArrayContainsActorByJoin: {
		title: 'Shared List Access',
		tagline: 'User in member list on related table',
		icon: UserCheck,
		category: 'needs-table',
		hasTableModule: false,
		fieldOverrides: {
			owned_schema: {
				hidden: true,
				// Injected dynamically from current database context at submit time
			},
			owned_table: {
				label: 'Related Table',
				placeholder: 'groups',
				description: 'Table containing the member list',
			},
			owned_table_key: {
				label: 'Member List Column',
				placeholder: 'member_ids',
				description: 'List column in related table',
			},
			owned_table_ref_key: {
				label: 'Reference Key',
				placeholder: 'id',
				description: 'FK column in related table',
			},
			this_object_key: {
				label: 'Foreign Key',
				placeholder: 'group_id',
				description: 'FK on this table to related table',
			},
		},
		diagramKey: 'array-contains-actor-by-join',
		sortOrder: 4,
	},

	// === MEMBERSHIP PATTERNS ===

	AuthzMembership: {
		title: 'Membership Check',
		tagline: 'Access via app/org/group membership',
		icon: Globe,
		category: 'no-fields',
		hasTableModule: false,
		fieldOverrides: {
			membership_type: {
				label: 'Membership Scope',
				description: '1=app, 2=org, 3=group',
				defaultValue: 1,
			},
			permission: {
				label: 'Required Permission',
				description: 'Optional permission to check',
				perOperation: true,
			},
			is_admin: {
				label: 'Require Admin',
				description: 'Require is_admin flag',
				perOperation: true,
			},
			is_owner: {
				label: 'Require Owner',
				description: 'Require is_owner flag',
				perOperation: true,
			},
		},
		advancedFields: ['is_admin', 'is_owner', 'admin_owner_logic'],
		diagramKey: 'membership',
		sortOrder: 10,
	},

	AuthzEntityMembership: {
		title: 'Entity Membership',
		tagline: 'Access via membership in row entity',
		icon: Shield,
		category: 'has-module',
		hasTableModule: true,
		tableModuleType: 'DataEntityMembership',
		fieldOverrides: {
			entity_field: {
				label: 'Entity Field Name',
				placeholder: 'entity_id',
				description: 'Column referencing the org/group',
				defaultValue: 'entity_id',
			},
			membership_type: {
				label: 'Membership Scope',
				description: '1=app, 2=org, 3=group',
			},
			permission: {
				label: 'Required Permission',
				perOperation: true,
			},
			is_admin: {
				label: 'Require Admin',
				perOperation: true,
			},
			is_owner: {
				label: 'Require Owner',
				perOperation: true,
			},
		},
		// DataEntityMembership supports custom field name via entity_field_name
		advancedFields: ['entity_field', 'is_admin', 'is_owner', 'admin_owner_logic'],
		diagramKey: 'membership-by-field',
		sortOrder: 11,
	},

	AuthzRelatedEntityMembership: {
		title: 'Related Entity Membership',
		tagline: 'Access via membership lookup in linked table',
		icon: Link,
		category: 'needs-table',
		hasTableModule: false,
		fieldOverrides: {
			entity_field: {
				label: 'Foreign Key Field',
				description: 'Field on this table referencing the linked table',
			},
			membership_type: {
				label: 'Membership Scope',
			},
			obj_schema: {
				hidden: true,
				// Injected dynamically from current database context at submit time
			},
			obj_table: {
				label: 'Linked Table',
				description: 'Table to check for membership',
			},
			obj_field: {
				label: 'Entity Field on Linked Table',
				description: 'Field containing entity ID for membership check',
			},
			permission: {
				label: 'Required Permission',
				perOperation: true,
			},
			is_admin: {
				label: 'Require Admin',
				perOperation: true,
			},
			is_owner: {
				label: 'Require Owner',
				perOperation: true,
			},
		},
		advancedFields: ['is_admin', 'is_owner', 'admin_owner_logic'],
		diagramKey: 'membership-by-join',
		sortOrder: 12,
	},

	AuthzOrgHierarchy: {
		title: 'Org Hierarchy',
		tagline: 'Manager/subordinate visibility',
		icon: Network,
		category: 'has-module',
		hasTableModule: true,
		tableModuleType: 'DataOwnershipInEntity',
		fieldOverrides: {
			direction: {
				label: 'Direction',
				description: 'down=manager sees subordinates, up=subordinate sees managers',
				defaultValue: 'down',
			},
			entity_field: {
				label: 'Entity Field Name',
				placeholder: 'entity_id',
				description: 'Field referencing the org entity',
				defaultValue: 'entity_id',
			},
			anchor_field: {
				label: 'Anchor Field',
				placeholder: 'owner_id',
				description: 'Field referencing the user (e.g., owner_id)',
			},
			max_depth: {
				label: 'Max Depth',
				description: 'Optional max depth to limit visibility',
			},
		},
		advancedFields: ['entity_field', 'max_depth'],
		diagramKey: 'org-hierarchy',
		sortOrder: 13,
	},

	// === TEMPORAL/PUBLISHING PATTERNS ===

	AuthzPublishable: {
		title: 'Published Content',
		tagline: 'Access only published records',
		icon: Eye,
		category: 'has-module',
		hasTableModule: true,
		tableModuleType: 'DataPublishable',
		fieldOverrides: {
			is_published_field: {
				label: 'Published Flag Field',
				placeholder: 'is_published',
				defaultValue: 'is_published',
			},
			published_at_field: {
				label: 'Published At Field',
				placeholder: 'published_at',
				defaultValue: 'published_at',
			},
			require_published_at: {
				label: 'Require Published At',
				description: 'Also check published_at <= now()',
				defaultValue: true,
			},
		},
		advancedFields: ['is_published_field', 'published_at_field', 'require_published_at'],
		diagramKey: 'publishable',
		sortOrder: 20,
	},

	AuthzTemporal: {
		title: 'Temporal Access',
		tagline: 'Time-window based access',
		icon: Clock,
		category: 'needs-fields',
		hasTableModule: false,
		fieldOverrides: {
			valid_from_field: {
				label: 'Valid From Field',
				placeholder: 'valid_from',
				description: 'Column for start time',
				defaultValue: 'valid_from',
				pgType: 'timestamptz',
			},
			valid_until_field: {
				label: 'Valid Until Field',
				placeholder: 'valid_until',
				description: 'Column for end time',
				defaultValue: 'valid_until',
				pgType: 'timestamptz',
			},
			valid_from_inclusive: {
				label: 'Include Start',
				defaultValue: true,
			},
			valid_until_inclusive: {
				label: 'Include End',
				defaultValue: false,
			},
		},
		advancedFields: ['valid_from_inclusive', 'valid_until_inclusive'],
		diagramKey: 'temporal',
		sortOrder: 21,
	},

	// === SIMPLE POLICIES ===

	AuthzAllowAll: {
		title: 'Public Access',
		tagline: 'Allow all authenticated users',
		icon: Unlock,
		category: 'no-fields',
		hasTableModule: false,
		diagramKey: 'allow-all',
		sortOrder: 100,
	},

	AuthzDenyAll: {
		title: 'No Access',
		tagline: 'Block all access',
		icon: Lock,
		category: 'no-fields',
		hasTableModule: false,
		diagramKey: 'deny-all',
		sortOrder: 101,
	},

	// === COMPOSITE POLICY ===

	AuthzComposite: {
		title: 'Composite Policy',
		tagline: 'Combine multiple rules with AND/OR',
		icon: Layers,
		category: 'no-fields',
		hasTableModule: false,
		diagramKey: 'composite',
		sortOrder: 200,
	},
};

/**
 * Get UI config for a policy type
 */
export function getPolicyTypeUIConfig(policyType: string): PolicyTypeUIConfig | undefined {
	return POLICY_TYPE_UI_CONFIG[policyType];
}

/**
 * Check if a policy type has UI configuration
 */
export function hasPolicyTypeUIConfig(policyType: string): boolean {
	return policyType in POLICY_TYPE_UI_CONFIG;
}

// ============================================================================
// GENERATED FIELDS
// ============================================================================

/**
 * Fields that are auto-generated by each table module type.
 *
 * When a policy uses a table module (hasTableModule: true), these fields
 * will be automatically created on the table.
 */
export const TABLE_MODULE_GENERATED_FIELDS: Record<string, GeneratedField[]> = {
	DataDirectOwner: [
		{
			name: 'owner_id',
			type: 'uuid',
			nullable: false,
			description: 'References the owning user',
		},
	],

	DataEntityMembership: [
		{
			name: 'entity_id',
			type: 'uuid',
			nullable: false,
			description: 'References the organization or group',
		},
	],

	DataOwnershipInEntity: [
		{
			name: 'owner_id',
			type: 'uuid',
			nullable: false,
			description: 'References the owning user',
		},
		{
			name: 'entity_id',
			type: 'uuid',
			nullable: false,
			description: 'References the organization or group',
		},
	],

	DataPublishable: [
		{
			name: 'is_published',
			type: 'boolean',
			nullable: false,
			description: 'Whether the record is published',
		},
		{
			name: 'published_at',
			type: 'timestamptz',
			nullable: true,
			description: 'When the record was published',
		},
	],

	DataTimestamps: [
		{
			name: 'created_at',
			type: 'timestamptz',
			nullable: false,
			description: 'When the record was created',
		},
		{
			name: 'updated_at',
			type: 'timestamptz',
			nullable: false,
			description: 'When the record was last updated',
		},
	],

	DataPeoplestamps: [
		{
			name: 'created_by',
			type: 'uuid',
			nullable: true,
			description: 'User who created the record',
		},
		{
			name: 'updated_by',
			type: 'uuid',
			nullable: true,
			description: 'User who last updated the record',
		},
	],

	DataSoftDelete: [
		{
			name: 'is_deleted',
			type: 'boolean',
			nullable: false,
			description: 'Whether the record is soft-deleted',
		},
		{
			name: 'deleted_at',
			type: 'timestamptz',
			nullable: true,
			description: 'When the record was deleted',
		},
	],
};

/**
 * Get generated fields for a table module type
 */
export function getGeneratedFields(tableModuleType: string): GeneratedField[] {
	return TABLE_MODULE_GENERATED_FIELDS[tableModuleType] ?? [];
}

/**
 * Derives the mapping from generated field names to policy keys for a given policy type.
 * This is computed from fieldOverrides where defaultValue matches a generated field name.
 *
 * Returns: { generatedFieldName: { policyKey, defaultValue } }
 */
export function getGeneratedFieldMappings(
	policyType: MergedPolicyType,
): Record<string, { policyKey: string; defaultValue: string }> | undefined {
	if (!policyType.tableModuleType) return undefined;

	const generatedFields = TABLE_MODULE_GENERATED_FIELDS[policyType.tableModuleType];
	if (!generatedFields) return undefined;

	const generatedFieldNames = new Set(generatedFields.map((f) => f.name));
	const result: Record<string, { policyKey: string; defaultValue: string }> = {};

	// For each field override, check if its defaultValue matches a generated field name
	for (const [policyKey, override] of Object.entries(policyType.fieldOverrides ?? {})) {
		const defaultValue = override?.defaultValue;
		if (typeof defaultValue === 'string' && generatedFieldNames.has(defaultValue)) {
			result[defaultValue] = { policyKey, defaultValue };
		}
	}

	return Object.keys(result).length > 0 ? result : undefined;
}

/**
 * Check if a table module type has generated fields defined
 */
export function hasGeneratedFields(tableModuleType: string): boolean {
	return tableModuleType in TABLE_MODULE_GENERATED_FIELDS;
}

// ============================================================================
// TABLE MODULE MAPPING
// ============================================================================

/**
 * Mapping from Authz* policy types to their corresponding Data* table modules.
 *
 * Some policies require a table module to auto-generate fields (e.g., owner_id).
 * This mapping defines which Data* module corresponds to each Authz* policy.
 */
export const AUTHZ_TO_DATA_MODULE_MAPPING: Record<string, string> = {
	AuthzDirectOwner: 'DataDirectOwner',
	AuthzEntityMembership: 'DataEntityMembership',
	AuthzPublishable: 'DataPublishable',
	AuthzOrgHierarchy: 'DataEntityMembership',
};

/**
 * Policies that do NOT require a table module.
 * These policies either:
 * - Don't need any fields (AuthzAllowAll, AuthzDenyAll, AuthzMembership)
 * - Require manual field configuration (join-based policies)
 */
export const POLICIES_WITHOUT_MODULE: string[] = [
	'AuthzAllowAll',
	'AuthzDenyAll',
	'AuthzMembership',
	'AuthzDirectOwnerAny',
	'AuthzRelatedEntityMembership',
	'AuthzRelatedMemberList',
	'AuthzComposite',
	'AuthzTemporal',
];

/**
 * Get the table module type for a policy type
 */
export function getTableModuleForPolicy(policyType: string): string | undefined {
	return AUTHZ_TO_DATA_MODULE_MAPPING[policyType];
}

/**
 * Check if a policy type requires a table module
 */
export function policyRequiresModule(policyType: string): boolean {
	return policyType in AUTHZ_TO_DATA_MODULE_MAPPING;
}

/**
 * Check if a policy type can be used without a table module
 */
export function policyCanBeModuleless(policyType: string): boolean {
	return POLICIES_WITHOUT_MODULE.includes(policyType);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Sanitize policy data by removing undefined/null values
 */
export function sanitizePolicyData(data: Record<string, unknown>): Record<string, unknown> {
	const sanitized: Record<string, unknown> = {};

	for (const [key, value] of Object.entries(data)) {
		// Skip undefined/null values
		if (value === undefined || value === null) continue;

		// Skip empty strings
		if (typeof value === 'string' && value.trim() === '') continue;

		// Skip empty arrays
		if (Array.isArray(value) && value.length === 0) continue;

		sanitized[key] = value;
	}

	return sanitized;
}

/**
 * Build table module data from policy data
 *
 * Some table modules need specific configuration from the policy data
 * (e.g., DataDirectOwner may need a custom field name)
 */
export function buildTableModuleData(
	policyData: Record<string, unknown>,
	policyType: MergedPolicyType,
): Record<string, unknown> {
	if (!policyType.tableModuleType) {
		return {};
	}

	const moduleData: Record<string, unknown> = {};

	// For DataDirectOwner, if a custom entity_field is specified, pass it through
	if (policyType.tableModuleType === 'DataDirectOwner') {
		if (policyData.entity_field && policyData.entity_field !== 'owner_id') {
			moduleData.owner_field_name = policyData.entity_field;
		}
	}

	// For DataEntityMembership, pass through the entity_field if custom
	if (policyType.tableModuleType === 'DataEntityMembership') {
		if (policyData.entity_field && policyData.entity_field !== 'entity_id') {
			moduleData.entity_field_name = policyData.entity_field;
		}
	}

	return moduleData;
}

/**
 * Build a policy name from table name and policy type
 */
export function buildPolicyName(tableName: string, policyType: string): string {
	// Convert policyType from PascalCase to snake_case
	const snakeType = policyType
		.replace(/^Authz/, '')
		.replace(/([A-Z])/g, '_$1')
		.toLowerCase()
		.replace(/^_/, '');

	return `${tableName}_${snakeType}`;
}

/**
 * Validate that all required context values are present
 */
export function validateContext(context: { databaseId?: string; schemaId?: string; privateSchemaId?: string }): {
	valid: boolean;
	missing: string[];
} {
	const missing: string[] = [];

	if (!context.databaseId) missing.push('databaseId');
	if (!context.schemaId) missing.push('schemaId');
	// privateSchemaId is optional - backend can derive it

	return {
		valid: missing.length === 0,
		missing,
	};
}

/**
 * Schema fields that should be auto-injected from context
 */
const AUTO_INJECT_SCHEMA_FIELDS = ['owned_schema', 'obj_schema'];

/**
 * Inject schema ID into policy data for fields that require it.
 * These fields are hidden from the form but need to be populated at submit time.
 */
export function injectSchemaFields(
	policyData: Record<string, unknown>,
	schemaId: string,
	policyType: string,
): Record<string, unknown> {
	const config = POLICY_TYPE_UI_CONFIG[policyType];
	if (!config?.fieldOverrides) return policyData;

	const result = { ...policyData };

	for (const field of AUTO_INJECT_SCHEMA_FIELDS) {
		const override = config.fieldOverrides[field];
		// Only inject if field is hidden and not already set
		if (override?.hidden && result[field] === undefined) {
			result[field] = schemaId;
		}
	}

	return result;
}

// ============================================================================
// CATEGORY HELPERS
// ============================================================================

/**
 * Get the policy category for a policy type
 */
export function getPolicyCategory(policyType: string): PolicyCategory {
	return POLICY_TYPE_UI_CONFIG[policyType]?.category ?? 'no-fields';
}

/**
 * Get fields that need database columns created (those with pgType in fieldOverrides)
 */
export function getFieldsRequiringColumns(
	policyType: string,
): { key: string; defaultName: string; pgType: NonNullable<FieldOverride['pgType']> }[] {
	const config = POLICY_TYPE_UI_CONFIG[policyType];
	if (!config?.fieldOverrides) return [];

	const result: { key: string; defaultName: string; pgType: NonNullable<FieldOverride['pgType']> }[] = [];
	for (const [key, override] of Object.entries(config.fieldOverrides)) {
		if (override.pgType) {
			result.push({
				key,
				defaultName: typeof override.defaultValue === 'string' ? override.defaultValue : key,
				pgType: override.pgType,
			});
		}
	}
	return result;
}

/**
 * Check if a policy type needs explicit field creation
 */
export function policyNeedsFieldCreation(policyType: string): boolean {
	return POLICY_TYPE_UI_CONFIG[policyType]?.category === 'needs-fields';
}
