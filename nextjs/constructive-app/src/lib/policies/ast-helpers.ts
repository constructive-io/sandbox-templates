import { nodes } from 'pg-ast';

import type { ConditionGroupNode, ConditionLeafNode } from '@/components/policies/condition-builder/types';
import type { PolicyConditionData } from '@/components/policies/policies.types';
import { getPolicyTypeSchema, sanitizePolicyTypeData, type PolicyTypeId } from '@/components/policies/template-schema';

export const and = (...args: any[]) =>
	nodes.boolExpr({
		boolop: 'AND_EXPR',
		args,
	});

export const or = (...args: any[]) =>
	nodes.boolExpr({
		boolop: 'OR_EXPR',
		args,
	});

function mapLeafToAstNode(leaf: ConditionLeafNode<PolicyConditionData>): unknown | null {
	const policyTypeId = leaf.data.policyType as PolicyTypeId;
	const schema = getPolicyTypeSchema(policyTypeId, leaf.data.data);
	if (!schema || !schema.astNode) return null;

	const data = sanitizePolicyTypeData(policyTypeId, (leaf.data.data || {}) as Record<string, unknown>);

	return {
		[schema.astNode]: data,
	};
}

export function mapConditionNodeToAst(
	node: ConditionGroupNode<PolicyConditionData> | ConditionLeafNode<PolicyConditionData>,
): any | null {
	if (node.type === 'condition') {
		return mapLeafToAstNode(node);
	}

	const childExprs = node.children
		.map((child) => mapConditionNodeToAst(child as any))
		.filter((child): child is NonNullable<typeof child> => Boolean(child));

	if (childExprs.length === 0) return null;
	if (childExprs.length === 1) return childExprs[0];

	return node.operator === 'AND' ? and(...childExprs) : or(...childExprs);
}
