import { Building2, Globe, Link, Lock, Shield, Unlock, User, UserCheck, Users } from 'lucide-react';

import type { PolicyTableData } from '@/lib/gql/hooks/schema-builder/policies/use-database-policies';

import type { ConditionGroupNode, ConditionLeafNode, ConditionNode } from './condition-builder/types';
import { MEMBERSHIP_TYPE_OPTIONS, type PolicyTypeKey } from './policies.types';
import type { PolicyConditionData } from './policies.types';

export type FieldType =
	| 'field-select'
	| 'field-multi-select'
	| 'table-select'
	| 'membership-type-select'
	| 'permission-select'
	| 'access-type-radio'
	| 'text';

export interface FieldSchema {
	key: string;
	type: FieldType;
	label: string;
	description?: string;
	placeholder?: string;
	required?: boolean;
	dependsOn?: string;
	fullWidth?: boolean;
}

export type PreviewVarKind = 'field' | 'fields' | 'table' | 'membership' | 'permission' | 'access';

export interface PreviewVar {
	name: string;
	kind: PreviewVarKind;
	optional?: boolean;
	suffix?: string;
}

export interface PolicyTypePreview {
	policyType: string;
	vars: PreviewVar[];
}

export interface PolicyTypeSchema {
	id: string;
	label: string;
	description: string;
	explanation: string;
	preview: PolicyTypePreview;
	icon: React.ElementType;
	astNode: string | null;
	fields: FieldSchema[];
}

export interface PolicyTypeContext {
	fields: string[];
	tables: PolicyTableData[];
	getTableFields: (tableId: string) => string[];
}

const UI_POLICY_TYPE_DISCRIMINATOR_KEY = '__ui_policy_type';

export type PolicyTypeId = PolicyTypeKey;
export type PolicyTypeDataMap = {
	AuthzAllowAll: Record<string, never>;
	AuthzDenyAll: Record<string, never>;
	AuthzDirectOwner: { entity_field: string };
	/** @deprecated Use AuthzEntityMembership with membership_type: 2 instead. Kept for backwards compatibility. */
	OwnedRecords: {
		entity_field: string;
		membership_type: 2;
		permission?: string;
		[UI_POLICY_TYPE_DISCRIMINATOR_KEY]: 'OwnedRecords';
	};
	AuthzDirectOwnerAny: { entity_fields: string[] };
	AuthzRelatedMemberList: {
		owned_schema: string;
		owned_table: string;
		owned_table_key: string;
		owned_table_ref_key: string;
		this_object_key: string;
	};
	AuthzEntityMembership: {
		entity_field: string;
		membership_type: number | null;
		permission?: string;
		[UI_POLICY_TYPE_DISCRIMINATOR_KEY]?: 'AuthzEntityMembership';
	};
	AuthzRelatedEntityMembership: {
		entity_field: string;
		sel_obj: boolean;
		sel_field: string;
		obj_schema: string;
		obj_table: string;
		obj_field: string;
		membership_join_field: string;
		membership_type: number | null;
	};
	AuthzMembership: { membership_type: number | null; is_admin?: boolean; permission?: string };
};

export type PolicyTypeData = PolicyTypeDataMap[PolicyTypeId];

function inferMembershipByFieldVariant(data: Record<string, unknown> | null | undefined): PolicyTypeId {
	if (data && typeof data === 'object') {
		const discriminator = data[UI_POLICY_TYPE_DISCRIMINATOR_KEY];
		if (discriminator === 'OwnedRecords') return 'OwnedRecords';
		if (discriminator === 'AuthzEntityMembership') return 'AuthzEntityMembership';
	}
	if (data && typeof data === 'object' && 'membership_type' in data) return 'AuthzEntityMembership';
	return 'OwnedRecords';
}

export function fromBackendPolicyTypeId(
	backendPolicyTypeId: string,
	data?: Record<string, unknown> | null,
): PolicyTypeId | 'AuthzComposite' | undefined {
	if (backendPolicyTypeId === 'AuthzComposite') return 'AuthzComposite';
	if (backendPolicyTypeId === 'AuthzEntityMembership') {
		return inferMembershipByFieldVariant(data);
	}
	if (backendPolicyTypeId in POLICY_TYPE_SCHEMAS) return backendPolicyTypeId as PolicyTypeId;
	return undefined;
}

export function toBackendPolicyTypeId(policyTypeId: PolicyTypeId | 'AuthzComposite'): string {
	if (policyTypeId === 'AuthzComposite') return 'AuthzComposite';
	if (policyTypeId === 'AuthzEntityMembership' || policyTypeId === 'OwnedRecords') {
		return 'AuthzEntityMembership';
	}
	return policyTypeId;
}

export const POLICY_TYPE_SCHEMAS: Record<PolicyTypeId, PolicyTypeSchema> = {
	AuthzDirectOwner: {
		id: 'AuthzDirectOwner',
		label: 'Organization Owner',
		description: "Access only to the current user's own rows.",
		explanation: 'Users can access rows where the selected field matches their user ID.',
		preview: {
			policyType: 'Users can access rows where {entity_field} matches their user ID',
			vars: [{ name: 'entity_field', kind: 'field' }],
		},
		icon: User,
		astNode: 'DirectOwner',
		fields: [
			{
				key: 'entity_field',
				type: 'field-select',
				label: 'Entity field',
				description: 'Select the column that directly stores the owner user id.',
				required: true,
			},
		],
	},
	/**
	 * @deprecated Use AuthzEntityMembership with membership_type: 2 instead.
	 * Kept for backwards compatibility with existing policies.
	 */
	OwnedRecords: {
		id: 'OwnedRecords',
		label: 'Organization Owned',
		description: "Access to rows owned by the user's organization.",
		explanation: 'Users can access rows owned by organizations they belong to.',
		preview: {
			policyType: 'Users can access rows where {entity_field} belongs to an organization they belong to',
			vars: [
				{ name: 'entity_field', kind: 'field' },
				{ name: 'permission', kind: 'permission', optional: true, suffix: ' with {value} permission' },
			],
		},
		icon: UserCheck,
		astNode: 'MembershipByField',
		fields: [
			{
				key: 'entity_field',
				type: 'field-select',
				label: 'Entity field',
				description: 'Column on this table that links to the owned entity.',
				required: true,
			},
			{
				key: 'permission',
				type: 'permission-select',
				label: 'Permission (optional)',
				description: 'Name of the ACL permission required for access.',
			},
		],
	},
	AuthzDirectOwnerAny: {
		id: 'AuthzDirectOwnerAny',
		label: 'Multi Owners',
		description: 'Access when any owner field matches the user.',
		explanation: 'Users can access rows where any of the selected fields matches their user ID.',
		preview: {
			policyType: 'Users can access rows where any of {entity_fields} matches their user ID',
			vars: [{ name: 'entity_fields', kind: 'fields' }],
		},
		icon: Users,
		astNode: 'DirectOwnerAny',
		fields: [
			{
				key: 'entity_fields',
				type: 'field-multi-select',
				label: 'Entity fields',
				description: 'Select columns that can own the row.',
				required: true,
			},
		],
	},
	AuthzRelatedMemberList: {
		id: 'AuthzRelatedMemberList',
		label: 'Member List',
		description: 'Access when the user is in a member list.',
		explanation: 'Users can access rows linked to records that list them as a member.',
		preview: {
			policyType:
				'Users can access rows where {this_object_key} references a {owned_table} record (via {owned_table_ref_key}) that includes them in {owned_table_key}',
			vars: [
				{ name: 'this_object_key', kind: 'field' },
				{ name: 'owned_table', kind: 'table' },
				{ name: 'owned_table_ref_key', kind: 'field' },
				{ name: 'owned_table_key', kind: 'field' },
			],
		},
		icon: Building2,
		astNode: 'ArrayContainsActorByJoin',
		fields: [
			{
				key: 'owned_table',
				type: 'table-select',
				label: 'Owned table',
				description: 'Schema-qualified table that stores group membership.',
				required: true,
			},
			{
				key: 'owned_table_key',
				type: 'field-select',
				label: 'Membership array column',
				description: 'Array column on the owned table containing user ids.',
				dependsOn: 'owned_table',
				required: true,
			},
			{
				key: 'owned_table_ref_key',
				type: 'field-select',
				label: 'Owned table ref key',
				description: 'Primary key field on the owned table.',
				dependsOn: 'owned_table',
				required: true,
			},
			{
				key: 'this_object_key',
				type: 'field-select',
				label: 'This table foreign key',
				description: 'Foreign key field on this table referencing the owned table.',
				required: true,
			},
		],
	},
	AuthzEntityMembership: {
		id: 'AuthzEntityMembership',
		label: 'Role-Based Access',
		description: 'Access based on role at app, org, or group level.',
		explanation: 'Users can access rows if they have the required role at that level.',
		preview: {
			policyType: 'Users can access rows where {entity_field} belongs to a {membership_type} they are a member of',
			vars: [
				{ name: 'entity_field', kind: 'field' },
				{ name: 'membership_type', kind: 'membership' },
				{ name: 'permission', kind: 'permission', optional: true, suffix: ' with {value} permission' },
			],
		},
		icon: Shield,
		astNode: 'MembershipByField',
		fields: [
			{
				key: 'entity_field',
				type: 'field-select',
				label: 'Entity field',
				description: 'Column whose values should match ACL entity ids.',
				required: true,
			},
			{
				key: 'membership_type',
				type: 'membership-type-select',
				label: 'Membership type',
				description: 'Scope of the permission check for this policy.',
				required: true,
			},
			{
				key: 'permission',
				type: 'permission-select',
				label: 'Permission (optional)',
				description: 'Name of the permission bit to require from the ACL row.',
				dependsOn: 'membership_type',
			},
		],
	},
	AuthzRelatedEntityMembership: {
		id: 'AuthzRelatedEntityMembership',
		label: 'Related Owner',
		description: 'Access via ownership through a related object.',
		explanation: 'Users can access rows linked to objects owned by entities they have membership to.',
		preview: {
			policyType:
				'Users can access rows where {entity_field} references a {obj_table} whose {obj_field} belongs to a {membership_type} they are a member of',
			vars: [
				{ name: 'entity_field', kind: 'field' },
				{ name: 'obj_table', kind: 'table' },
				{ name: 'obj_field', kind: 'field' },
				{ name: 'membership_type', kind: 'membership' },
			],
		},
		icon: Link,
		astNode: 'MembershipByJoin',
		fields: [
			{
				key: 'entity_field',
				type: 'field-select',
				label: 'Entity field',
				description: 'Foreign key on this table pointing to the object table.',
				required: true,
			},
			{
				key: 'membership_join_field',
				type: 'field-select',
				label: 'Membership join field',
				description: 'Column on this table used to match membership entity ids (defaults to entity_id).',
				required: true,
			},
			{
				key: 'obj_table',
				type: 'table-select',
				label: 'Object table',
				description: 'Table containing the owner/entity information.',
				required: true,
			},
			{
				key: 'sel_field',
				type: 'field-select',
				label: 'Object join field',
				description: 'Primary key field on object table to join on.',
				dependsOn: 'obj_table',
				required: true,
			},
			{
				key: 'obj_field',
				type: 'field-select',
				label: 'Object owner field',
				description: 'Column on object table storing the owner/entity id.',
				dependsOn: 'obj_table',
				required: true,
			},
			{
				key: 'membership_type',
				type: 'membership-type-select',
				label: 'Membership type',
				description: 'Scope of the permission check for this policy.',
				required: true,
			},
		],
	},
	AuthzMembership: {
		id: 'AuthzMembership',
		label: 'Global Permission',
		description: 'Access when the user has a required global right.',
		explanation: 'Users can access all rows if they have the required global or admin permission.',
		preview: {
			policyType: 'Users can access all rows at {membership_type} level',
			vars: [
				{ name: 'membership_type', kind: 'membership' },
				{ name: 'is_admin', kind: 'access', optional: true, suffix: ' if they are an' },
				{ name: 'permission', kind: 'permission', optional: true, suffix: ' with {value} permission' },
			],
		},
		icon: Globe,
		astNode: 'Membership',
		fields: [
			{
				key: 'membership_type',
				type: 'membership-type-select',
				label: 'Membership type',
				description: 'Scope of the permission check for this policy.',
				required: true,
				fullWidth: true,
			},
			{
				key: 'is_admin',
				type: 'access-type-radio',
				label: 'Admin access',
				description: 'Allow any admin at this scope to access.',
				fullWidth: true,
			},
			{
				key: 'permission',
				type: 'permission-select',
				label: 'Permission (optional)',
				description: 'Name of the permission required for non-admin access.',
				fullWidth: true,
			},
		],
	},
	AuthzAllowAll: {
		id: 'AuthzAllowAll',
		label: 'Allow All',
		description: 'Allow all rows for this policy.',
		explanation: 'The policy expression is TRUE, so every row matches.',
		preview: {
			policyType: 'All rows match (TRUE)',
			vars: [],
		},
		icon: Unlock,
		astNode: 'AllowAll',
		fields: [],
	},
	AuthzDenyAll: {
		id: 'AuthzDenyAll',
		label: 'Block All',
		description: 'Block all rows for this policy.',
		explanation: 'The policy expression is FALSE, so no rows match.',
		preview: {
			policyType: 'No rows match (FALSE)',
			vars: [],
		},
		icon: Lock,
		astNode: 'DenyAll',
		fields: [],
	},
};

export const COMPOSITE_POLICY_TYPE = {
	id: 'AuthzComposite',
	label: 'Composite Policy',
	description: 'Composite policy combining multiple access checks.',
} as const;

export const POLICY_TYPE_LIST = Object.values(POLICY_TYPE_SCHEMAS);
export const CONDITION_BUILDER_POLICY_TYPES = POLICY_TYPE_LIST.filter((t) => t.astNode !== null);

export function getPolicyTypeSchema(
	policyTypeId: string,
	data?: Record<string, unknown> | null,
): PolicyTypeSchema | undefined {
	const uiPolicyTypeId = fromBackendPolicyTypeId(policyTypeId, data) ?? (policyTypeId as PolicyTypeId);
	return POLICY_TYPE_SCHEMAS[uiPolicyTypeId as PolicyTypeId];
}

export function getPolicyTypeLabel(policyTypeId: string, data?: Record<string, unknown> | null): string {
	const uiPolicyTypeId = fromBackendPolicyTypeId(policyTypeId, data);
	if (uiPolicyTypeId === 'AuthzComposite') return COMPOSITE_POLICY_TYPE.label;
	if (uiPolicyTypeId) return POLICY_TYPE_SCHEMAS[uiPolicyTypeId]?.label || uiPolicyTypeId;
	return policyTypeId;
}

const DEFAULT_DATA: PolicyTypeDataMap = {
	AuthzAllowAll: {},
	AuthzDenyAll: {},
	AuthzDirectOwner: { entity_field: '' },
	OwnedRecords: {
		entity_field: '',
		membership_type: 2,
		permission: undefined,
		[UI_POLICY_TYPE_DISCRIMINATOR_KEY]: 'OwnedRecords',
	},
	AuthzDirectOwnerAny: { entity_fields: [] },
	AuthzRelatedMemberList: {
		owned_schema: '',
		owned_table: '',
		owned_table_key: '',
		owned_table_ref_key: '',
		this_object_key: '',
	},
	AuthzEntityMembership: {
		entity_field: '',
		membership_type: null,
		permission: undefined,
		[UI_POLICY_TYPE_DISCRIMINATOR_KEY]: 'AuthzEntityMembership',
	},
	AuthzRelatedEntityMembership: {
		entity_field: '',
		sel_obj: true,
		sel_field: '',
		obj_schema: '',
		obj_table: '',
		obj_field: '',
		membership_join_field: 'entity_id',
		membership_type: null,
	},
	AuthzMembership: { membership_type: null, is_admin: false, permission: undefined },
};

export function getDefaultData<T extends PolicyTypeId>(policyTypeId: T): PolicyTypeDataMap[T] {
	return structuredClone(DEFAULT_DATA[policyTypeId]) as PolicyTypeDataMap[T];
}

export function getMembershipTypeLabel(value: number | null): string {
	if (value === null) return '';
	const option = MEMBERSHIP_TYPE_OPTIONS.find((o) => o.value === value);
	return option?.label ?? '';
}

export function sanitizePolicyTypeData(
	policyTypeId: PolicyTypeId,
	data: Record<string, unknown>,
): Record<string, unknown> {
	const schema = POLICY_TYPE_SCHEMAS[policyTypeId];
	if (!schema) return data;
	const allowedKeys = new Set(schema.fields.map((f) => f.key));
	allowedKeys.add(UI_POLICY_TYPE_DISCRIMINATOR_KEY);
	if (allowedKeys.has('owned_table')) allowedKeys.add('owned_schema');
	if (allowedKeys.has('obj_table')) allowedKeys.add('obj_schema');
	if (policyTypeId === 'OwnedRecords') allowedKeys.add('membership_type');

	const filtered: Record<string, unknown> = {};
	for (const key of Object.keys(data)) {
		if (allowedKeys.has(key)) {
			filtered[key] = data[key];
		}
	}
	return filtered;
}

function validateSinglePolicyTypeData(policyTypeId: PolicyTypeId, data: Record<string, unknown>): boolean {
	const schema = POLICY_TYPE_SCHEMAS[policyTypeId];
	if (!schema) return false;

	for (const field of schema.fields) {
		if (!field.required) continue;

		const value = data[field.key];

		if (field.type === 'field-select' || field.type === 'table-select' || field.type === 'text') {
			if (typeof value !== 'string' || value.trim() === '') {
				return false;
			}
		} else if (field.type === 'field-multi-select') {
			if (!Array.isArray(value) || value.length === 0) {
				return false;
			}
		} else if (field.type === 'membership-type-select') {
			if (value === null || value === undefined) {
				return false;
			}
		}
	}

	return true;
}

function validateConditionNode(node: ConditionNode<PolicyConditionData>): boolean {
	if (node.type === 'group') {
		return node.children.every((child) => validateConditionNode(child));
	}

	if (node.type === 'condition') {
		const { policyType, data } = node.data;
		if (!policyType || policyType === 'Composite') return true;
		return validateSinglePolicyTypeData(policyType as PolicyTypeId, data);
	}

	return true;
}

export function isPolicyTypeDataValid(
	policyTypeId: PolicyTypeId | 'Composite',
	data: Record<string, unknown>,
): boolean {
	if (policyTypeId === 'Composite') return true;

	const schema = POLICY_TYPE_SCHEMAS[policyTypeId];
	if (!schema) return false;

	return validateSinglePolicyTypeData(policyTypeId, data);
}

export function isCompositeConditionTreeValid(conditionRoot: ConditionGroupNode<PolicyConditionData>): boolean {
	return validateConditionNode(conditionRoot);
}

export function isConditionNodeValid(node: ConditionLeafNode<PolicyConditionData>): boolean {
	const { policyType, data } = node.data;
	if (!policyType || policyType === 'Composite') return true;
	return validateSinglePolicyTypeData(policyType as PolicyTypeId, data);
}
