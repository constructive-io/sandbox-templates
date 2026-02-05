'use client';

import type { PolicyTableData } from '@/lib/gql/hooks/schema-builder/policies/use-database-policies';

import { TemplateFieldsRenderer, type FieldOption } from './template-fields';
import type { PolicyTypeDataMap, PolicyTypeId } from './template-schema';

export type { PolicyTypeDataMap, PolicyTypeId };

export type DirectOwnerData = PolicyTypeDataMap['AuthzDirectOwner'];
export type OwnedRecordsData = PolicyTypeDataMap['OwnedRecords'];
export type DirectOwnerAnyData = PolicyTypeDataMap['AuthzDirectOwnerAny'];
export type ArrayContainsActorByJoinData = PolicyTypeDataMap['AuthzArrayContainsActorByJoin'];
export type MembershipByFieldData = PolicyTypeDataMap['AuthzMembershipByField'];
export type MembershipByJoinData = PolicyTypeDataMap['AuthzMembershipByJoin'];
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
export const ArrayContainsActorByJoinConfig = createPolicyTypeConfig('AuthzArrayContainsActorByJoin');
export const MembershipByFieldConfig = createPolicyTypeConfig('AuthzMembershipByField');
export const MembershipByJoinConfig = createPolicyTypeConfig('AuthzMembershipByJoin');
export const MembershipConfig = createPolicyTypeConfig('AuthzMembership');
