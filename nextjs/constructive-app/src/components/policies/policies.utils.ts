import type { TableCategory } from '@/lib/gql/hooks/schema-builder/policies/use-database-policies';

import type { ConditionGroupNode, ConditionLeafNode } from './condition-builder/types';
import type { PolicyConditionData } from './policies.types';
import { POLICY_PRIVILEGES, POLICY_ROLES } from './policies.types';
import { getDefaultData } from './template-schema';

export function isSystemTable(category: TableCategory): boolean {
	return category === 'CORE' || category === 'MODULE';
}

export function getRoleLabel(roleValue: string): string {
	return POLICY_ROLES.find((r) => r.value === roleValue)?.label || roleValue;
}

export function getPrivilegeLabel(privilegeValue: string): string {
	return POLICY_PRIVILEGES.find((p) => p.value === privilegeValue)?.label || privilegeValue;
}

export function updateConditionData(
	root: ConditionGroupNode<PolicyConditionData>,
	leafId: string,
	newData: PolicyConditionData,
): ConditionGroupNode<PolicyConditionData> {
	const updateNode = (
		node: ConditionGroupNode<PolicyConditionData> | ConditionLeafNode<PolicyConditionData>,
	): ConditionGroupNode<PolicyConditionData> | ConditionLeafNode<PolicyConditionData> => {
		if (node.type === 'condition') {
			if (node.id === leafId) {
				return { ...node, data: newData };
			}
			return node;
		}
		return {
			...node,
			children: node.children.map(updateNode),
		};
	};

	return updateNode(root) as ConditionGroupNode<PolicyConditionData>;
}

function createUniqueNodeId(prefix: string): string {
	try {
		if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
			return `${prefix}-${crypto.randomUUID()}`;
		}
	} catch {
		// ignore
	}
	return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createNewPolicyCondition(): ConditionLeafNode<PolicyConditionData> {
	const id = createUniqueNodeId('c');
	return {
		id,
		type: 'condition',
		data: {
			policyType: 'AuthzDirectOwner',
			data: getDefaultData('AuthzDirectOwner'),
		},
	};
}

export function createInitialConditionRoot(): ConditionGroupNode<PolicyConditionData> {
	return {
		id: 'root',
		type: 'group',
		operator: 'AND',
		children: [createNewPolicyCondition()],
	};
}
