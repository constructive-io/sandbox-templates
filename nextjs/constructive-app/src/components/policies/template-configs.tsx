'use client';

import type { PolicyTableData } from '@/lib/gql/hooks/schema-builder/policies/use-database-policies';

import { TemplateFieldsRenderer, type FieldOption } from './template-fields';
import type { PolicyTypeDataMap, PolicyTypeId } from './template-schema';

export type { PolicyTypeDataMap, PolicyTypeId };

export type DirectOwnerData = PolicyTypeDataMap['AuthzDirectOwner'];
export type OwnedRecordsData = PolicyTypeDataMap['OwnedRecords'];
export type DirectOwnerAnyData = PolicyTypeDataMap['AuthzDirectOwnerAny'];
export type ArrayContainsActorByJoinData = PolicyTypeDataMap['AuthzRelatedMemberList'];
export type MembershipByFieldData = PolicyTypeDataMap['AuthzEntityMembership'];
export type MembershipByJoinData = PolicyTypeDataMap['AuthzRelatedEntityMembership'];
export type MembershipData = PolicyTypeDataMap['AuthzMembership'];

interface PolicyTypeConfigProps<T extends PolicyTypeId> {
	value: PolicyTypeDataMap[T];
	onChange: (value: PolicyTypeDataMap[T]) => void;
	fields: FieldOption[];
	tables?: PolicyTableData[];
}

function createPolicyTypeConfig<T extends PolicyTypeId>(policyTypeId: T) {
	return function PolicyTypeConfig({ value, onChange, fields, tables = [] }: PolicyTypeConfigProps<T>) {
		return (
			<TemplateFieldsRenderer
				policyTypeId={policyTypeId}
				data={value as Record<string, unknown>}
				onChange={(data) => onChange(data as PolicyTypeDataMap[T])}
				variant='full'
				fields={fields}
				tables={tables}
			/>
		);
	};
}

export const DirectOwnerConfig = createPolicyTypeConfig('AuthzDirectOwner');
export const OwnedRecordsConfig = createPolicyTypeConfig('OwnedRecords');
export const DirectOwnerAnyConfig = createPolicyTypeConfig('AuthzDirectOwnerAny');
export const ArrayContainsActorByJoinConfig = createPolicyTypeConfig('AuthzRelatedMemberList');
export const MembershipByFieldConfig = createPolicyTypeConfig('AuthzEntityMembership');
export const MembershipByJoinConfig = createPolicyTypeConfig('AuthzRelatedEntityMembership');
export const MembershipConfig = createPolicyTypeConfig('AuthzMembership');
