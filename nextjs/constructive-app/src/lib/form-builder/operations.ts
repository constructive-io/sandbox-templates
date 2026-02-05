import { createGridColumnNode } from './node-factory';
import type { UINode, UISchema } from './types';
import { isGridNode } from './types';

export function cloneSchema(schema: UISchema): UISchema {
	return JSON.parse(JSON.stringify(schema));
}

export function cloneNode(node: UINode): UINode {
	return JSON.parse(JSON.stringify(node));
}

export function findNode(root: UINode, key: string): UINode | null {
	if (root.key === key) return root;
	for (const child of root.children ?? []) {
		const found = findNode(child, key);
		if (found) return found;
	}
	return null;
}

export function findParent(root: UINode, key: string): { parent: UINode; index: number } | null {
	const children = root.children ?? [];
	for (let i = 0; i < children.length; i++) {
		if (children[i]?.key === key) {
			return { parent: root, index: i };
		}
		const found = findParent(children[i], key);
		if (found) return found;
	}
	return null;
}

export function findNodeByFieldId(root: UINode, fieldId: string): UINode | null {
	if (root.props?.fieldId === fieldId) return root;
	for (const child of root.children ?? []) {
		const found = findNodeByFieldId(child, fieldId);
		if (found) return found;
	}
	return null;
}

export function getAllFieldIds(root: UINode): string[] {
	const fieldIds: string[] = [];
	function collect(node: UINode): void {
		if (node.props?.fieldId) {
			fieldIds.push(node.props.fieldId as string);
		}
		for (const child of node.children ?? []) {
			collect(child);
		}
	}
	collect(root);
	return fieldIds;
}

export function addNodeToRoot(schema: UISchema, node: UINode, index?: number): UISchema {
	const newSchema = cloneSchema(schema);
	const insertIndex = index ?? newSchema.page.children.length;
	newSchema.page.children.splice(insertIndex, 0, node);
	return newSchema;
}

export function addNodeToGrid(
	schema: UISchema,
	gridKey: string,
	columnIndex: number,
	node: UINode,
	fieldIndex?: number,
): UISchema {
	const newSchema = cloneSchema(schema);
	const grid = findNode(newSchema.page, gridKey);
	if (!grid || !isGridNode(grid)) return schema;
	if (columnIndex < 0 || columnIndex >= grid.children.length) return schema;

	const column = grid.children[columnIndex];
	const insertIndex = fieldIndex ?? column.children.length;
	column.children.splice(insertIndex, 0, node);
	return newSchema;
}

export function removeNode(schema: UISchema, key: string): UISchema {
	const newSchema = cloneSchema(schema);
	const parentInfo = findParent(newSchema.page, key);
	if (!parentInfo) return schema;

	parentInfo.parent.children.splice(parentInfo.index, 1);
	return newSchema;
}

export function removeNodeByFieldId(schema: UISchema, fieldId: string): UISchema {
	const node = findNodeByFieldId(schema.page, fieldId);
	if (!node) return schema;
	return removeNode(schema, node.key);
}

export function updateNode(schema: UISchema, key: string, updates: Partial<UINode['props']>): UISchema {
	const newSchema = cloneSchema(schema);
	const node = findNode(newSchema.page, key);
	if (!node) return schema;

	node.props = { ...node.props, ...updates };
	return newSchema;
}

export function moveNode(schema: UISchema, key: string, newParentKey: string, newIndex?: number): UISchema {
	const node = findNode(schema.page, key);
	if (!node) return schema;

	let newSchema = removeNode(schema, key);
	const newParent = findNode(newSchema.page, newParentKey);
	if (!newParent) return schema;

	const insertIndex = newIndex ?? newParent.children.length;
	newParent.children.splice(insertIndex, 0, cloneNode(node));
	return newSchema;
}

export function reorderChildren(schema: UISchema, parentKey: string, fromIndex: number, toIndex: number): UISchema {
	const newSchema = cloneSchema(schema);
	const parent = parentKey === 'root' ? newSchema.page : findNode(newSchema.page, parentKey);
	if (!parent) return schema;

	const children = parent.children;
	if (fromIndex < 0 || fromIndex >= children.length || toIndex < 0 || toIndex >= children.length) {
		return schema;
	}

	const [removed] = children.splice(fromIndex, 1);
	children.splice(toIndex, 0, removed);
	return newSchema;
}

export function replaceFieldId(schema: UISchema, oldFieldId: string, newFieldId: string): UISchema {
	const newSchema = cloneSchema(schema);

	function replace(node: UINode): void {
		if (node.props?.fieldId === oldFieldId) {
			node.props.fieldId = newFieldId;
			node.key = newFieldId;
		}
		for (const child of node.children ?? []) {
			replace(child);
		}
	}

	replace(newSchema.page);
	return newSchema;
}

export function updateGridColumns(schema: UISchema, gridKey: string, newColumnCount: 2 | 3 | 4): UISchema {
	const newSchema = cloneSchema(schema);
	const grid = findNode(newSchema.page, gridKey);
	if (!grid || !isGridNode(grid)) return schema;

	const currentCount = grid.children.length;
	grid.props.columns = newColumnCount;

	if (newColumnCount > currentCount) {
		for (let i = currentCount; i < newColumnCount; i++) {
			grid.children.push(createGridColumnNode(gridKey, i));
		}
	} else if (newColumnCount < currentCount) {
		const fieldsToMove: UINode[] = [];
		for (let i = newColumnCount; i < currentCount; i++) {
			fieldsToMove.push(...grid.children[i].children);
		}
		grid.children = grid.children.slice(0, newColumnCount);
		if (fieldsToMove.length > 0) {
			grid.children[newColumnCount - 1].children.push(...fieldsToMove);
		}
	}

	return newSchema;
}

export function findGridContainingField(
	schema: UISchema,
	fieldId: string,
): { gridKey: string; columnIndex: number; fieldIndex: number } | null {
	for (const child of schema.page.children ?? []) {
		if (isGridNode(child)) {
			for (let colIdx = 0; colIdx < (child.children?.length ?? 0); colIdx++) {
				const column = child.children[colIdx];
				for (let fieldIdx = 0; fieldIdx < (column.children?.length ?? 0); fieldIdx++) {
					if (column.children[fieldIdx]?.props?.fieldId === fieldId) {
						return { gridKey: child.key, columnIndex: colIdx, fieldIndex: fieldIdx };
					}
				}
			}
		}
	}
	return null;
}
