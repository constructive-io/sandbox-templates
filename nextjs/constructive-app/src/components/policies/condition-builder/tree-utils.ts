import {
	ConditionGroupNode,
	ConditionLeafNode,
	ConditionLogicalOperator,
	ConditionNode,
	ConditionNodeId,
} from './types';

export function createEmptyGroup<TData = unknown>(
	operator: ConditionLogicalOperator,
	id: ConditionNodeId,
): ConditionGroupNode<TData> {
	return {
		id,
		type: 'group',
		operator,
		children: [],
	};
}

export type NodePath = ConditionNodeId[];

export function cloneTree<TData>(root: ConditionGroupNode<TData>): ConditionGroupNode<TData> {
	return JSON.parse(JSON.stringify(root));
}

function normalizeGroups<TData>(root: ConditionGroupNode<TData>): ConditionGroupNode<TData> {
	// Do not remove the root group itself, only its descendants.
	const normalizeChildren = (parent: ConditionGroupNode<TData>) => {
		for (let i = 0; i < parent.children.length; ) {
			const child = parent.children[i];
			if (child.type === 'group') {
				normalizeChildren(child);
				if (child.children.length === 0) {
					parent.children.splice(i, 1);
					continue;
				}
				if (child.children.length === 1) {
					// Replace the group with its single child
					parent.children.splice(i, 1, child.children[0]);
					continue;
				}
			}
			i += 1;
		}
	};

	const draft = cloneTree(root);
	normalizeChildren(draft);
	return draft;
}

export function findParentGroupAndIndex<TData>(
	root: ConditionGroupNode<TData>,
	nodeId: ConditionNodeId,
): { parent: ConditionGroupNode<TData>; index: number } | null {
	const stack: ConditionGroupNode<TData>[] = [root];

	while (stack.length) {
		const group = stack.pop()!;
		const index = group.children.findIndex((c) => c.id === nodeId);
		if (index !== -1) {
			return { parent: group, index };
		}
		for (const child of group.children) {
			if (child.type === 'group') {
				stack.push(child);
			}
		}
	}

	return null;
}

export function deleteNode<TData>(root: ConditionGroupNode<TData>, nodeId: ConditionNodeId): ConditionGroupNode<TData> {
	const draft = cloneTree(root);
	const res = findParentGroupAndIndex(draft, nodeId);
	if (!res) return draft;
	const { parent, index } = res;
	parent.children.splice(index, 1);
	return normalizeGroups(draft);
}

export type DropPosition = 'before' | 'after' | 'into';

export function moveNode<TData>(
	root: ConditionGroupNode<TData>,
	sourceId: ConditionNodeId,
	targetId: ConditionNodeId,
	position: DropPosition,
): ConditionGroupNode<TData> {
	if (sourceId === targetId) return root;

	const draft = cloneTree(root);
	const sourceInfo = findParentGroupAndIndex(draft, sourceId);
	if (!sourceInfo) return draft;

	const { parent: sourceParent, index: sourceIndex } = sourceInfo;
	const [node] = sourceParent.children.splice(sourceIndex, 1);

	if (position === 'into') {
		const targetNode = findNode(draft, targetId);
		if (!targetNode || targetNode.type !== 'group') {
			return draft;
		}
		targetNode.children.push(node);
		return draft;
	}

	const targetInfo = findParentGroupAndIndex(draft, targetId);
	if (!targetInfo) return draft;
	const { parent: targetParent, index: targetIndex } = targetInfo;

	let insertIndex = targetIndex;
	if (position === 'after') {
		insertIndex = targetIndex + (sourceParent === targetParent && sourceIndex < targetIndex ? 0 : 1);
	}

	targetParent.children.splice(insertIndex, 0, node);
	return normalizeGroups(draft);
}

export function groupTwoConditions<TData>(
	root: ConditionGroupNode<TData>,
	sourceId: ConditionNodeId,
	targetId: ConditionNodeId,
	operator: ConditionLogicalOperator,
): ConditionGroupNode<TData> {
	if (sourceId === targetId) return root;

	const draft = cloneTree(root);
	const sourceInfo = findParentGroupAndIndex(draft, sourceId);
	const targetInfo = findParentGroupAndIndex(draft, targetId);
	if (!sourceInfo || !targetInfo) return draft;

	const { parent: sourceParent, index: sourceIndex } = sourceInfo;
	const { parent: targetParent, index: targetIndex } = targetInfo;
	const [sourceNode] = sourceParent.children.splice(sourceIndex, 1);
	const adjustedTargetIndex =
		sourceParent === targetParent && sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
	const [targetNode] = targetParent.children.splice(adjustedTargetIndex, 1);

	if (sourceNode.type !== 'condition' || targetNode.type !== 'condition') {
		return draft;
	}

	const childrenOrder =
		sourceParent === targetParent && sourceIndex < targetIndex ? [sourceNode, targetNode] : [targetNode, sourceNode];

	const groupId: ConditionNodeId = `group-${Date.now()}` as ConditionNodeId;
	const newGroup: ConditionGroupNode<TData> = {
		id: groupId,
		type: 'group',
		operator,
		children: childrenOrder,
	};

	// Insert new group at the original target slot (after removal adjustment)
	targetParent.children.splice(adjustedTargetIndex, 0, newGroup);

	return normalizeGroups(draft);
}

export function findNode<TData>(root: ConditionGroupNode<TData>, nodeId: ConditionNodeId): ConditionNode<TData> | null {
	if (root.id === nodeId) return root;

	const stack: ConditionNode<TData>[] = [...root.children];

	while (stack.length) {
		const node = stack.pop()!;
		if (node.id === nodeId) return node;
		if (node.type === 'group') {
			stack.push(...node.children);
		}
	}

	return null;
}

export function insertNewCondition<TData>(
	root: ConditionGroupNode<TData>,
	groupId: ConditionNodeId,
	factory: () => ConditionLeafNode<TData>,
): ConditionGroupNode<TData> {
	const draft = cloneTree(root);
	const group = findNode(draft, groupId);
	if (!group || group.type !== 'group') return draft;
	group.children.push(factory());
	return draft;
}

export function toggleGroupOperator<TData>(
	root: ConditionGroupNode<TData>,
	groupId: ConditionNodeId,
): ConditionGroupNode<TData> {
	const draft = cloneTree(root);
	const group = findNode(draft, groupId);
	if (!group || group.type !== 'group') return draft;
	group.operator = group.operator === 'AND' ? 'OR' : 'AND';
	return draft;
}
