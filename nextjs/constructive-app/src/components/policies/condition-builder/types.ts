import { ReactNode } from 'react';

export type ConditionLogicalOperator = 'AND' | 'OR';

export type ConditionNodeId = string;

export interface ConditionLeafNode<TData = unknown> {
	id: ConditionNodeId;
	type: 'condition';
	data: TData;
}

export interface ConditionGroupNode<TData = unknown> {
	id: ConditionNodeId;
	type: 'group';
	operator: ConditionLogicalOperator;
	children: ConditionNode<TData>[];
}

export type ConditionNode<TData = unknown> = ConditionLeafNode<TData> | ConditionGroupNode<TData>;

export interface ConditionBuilderRenderContext<TData = unknown> {
	path: ConditionNodeId[];
	groupOperator: ConditionLogicalOperator;
	index: number;
	node: ConditionLeafNode<TData>;
}

export interface ConditionBuilderProps<TData = unknown> {
	value: ConditionGroupNode<TData>;
	onChange: (value: ConditionGroupNode<TData>) => void;
	renderCondition: (leaf: ConditionLeafNode<TData>, context: ConditionBuilderRenderContext<TData>) => ReactNode;
	getNewCondition: () => ConditionLeafNode<TData>;
}
