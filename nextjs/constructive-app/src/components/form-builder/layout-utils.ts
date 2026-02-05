import type { FormBuilderConfig, FormCanvasItem, FormLayout, FormLayoutColumns, TableDefinition } from '@/lib/schema';

const FORM_BUILDER_CONFIG_KEY = 'formBuilderConfig';

export function createEmptyFormBuilderConfig(): FormBuilderConfig {
	return {
		version: 1,
		canvasOrder: [],
		layouts: [],
	};
}

export function getFormBuilderConfig(table: TableDefinition | null): FormBuilderConfig {
	if (!table) return createEmptyFormBuilderConfig();

	const smartTags = (table as TableDefinition & { smartTags?: Record<string, unknown> }).smartTags;
	if (!smartTags || typeof smartTags !== 'object') {
		return createEmptyFormBuilderConfig();
	}

	const config = smartTags[FORM_BUILDER_CONFIG_KEY];
	if (!config || typeof config !== 'object') {
		return createEmptyFormBuilderConfig();
	}

	return config as FormBuilderConfig;
}

export function createLayout(columns: FormLayoutColumns, order: number): FormLayout {
	return {
		id: `layout-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
		type: 'layout',
		columns,
		cells: Array.from({ length: columns }, () => ({ fieldIds: [] })),
		order,
	};
}

export function addFieldToLayoutCell(layout: FormLayout, cellIndex: number, fieldId: string): FormLayout {
	if (cellIndex < 0 || cellIndex >= layout.cells.length) {
		return layout;
	}

	return {
		...layout,
		cells: layout.cells.map((cell, idx) =>
			idx === cellIndex ? { ...cell, fieldIds: [...cell.fieldIds, fieldId] } : cell,
		),
	};
}

export function removeFieldFromLayout(layout: FormLayout, fieldId: string): FormLayout {
	return {
		...layout,
		cells: layout.cells.map((cell) => ({
			...cell,
			fieldIds: cell.fieldIds.filter((id) => id !== fieldId),
		})),
	};
}

export function moveFieldBetweenCells(
	layout: FormLayout,
	fieldId: string,
	fromCellIndex: number,
	toCellIndex: number,
	toPosition?: number,
): FormLayout {
	if (
		fromCellIndex < 0 ||
		fromCellIndex >= layout.cells.length ||
		toCellIndex < 0 ||
		toCellIndex >= layout.cells.length
	) {
		return layout;
	}

	return {
		...layout,
		cells: layout.cells.map((cell, idx) => {
			if (idx === fromCellIndex) {
				return { ...cell, fieldIds: cell.fieldIds.filter((id) => id !== fieldId) };
			}
			if (idx === toCellIndex) {
				const newFieldIds = [...cell.fieldIds];
				const insertAt = toPosition !== undefined ? toPosition : newFieldIds.length;
				newFieldIds.splice(insertAt, 0, fieldId);
				return { ...cell, fieldIds: newFieldIds };
			}
			return cell;
		}),
	};
}

export function isLayoutEmpty(layout: FormLayout): boolean {
	return layout.cells.every((cell) => cell.fieldIds.length === 0);
}

export function getFieldIdsInLayout(layout: FormLayout): string[] {
	return layout.cells.flatMap((cell) => cell.fieldIds);
}

export function findLayoutContainingField(
	layouts: FormLayout[],
	fieldId: string,
): { layout: FormLayout; cellIndex: number } | null {
	for (const layout of layouts) {
		for (let cellIndex = 0; cellIndex < layout.cells.length; cellIndex++) {
			if (layout.cells[cellIndex].fieldIds.includes(fieldId)) {
				return { layout, cellIndex };
			}
		}
	}
	return null;
}

export function getStandaloneFieldIds(allFieldIds: string[], layouts: FormLayout[]): string[] {
	const fieldsInLayouts = new Set(layouts.flatMap(getFieldIdsInLayout));
	return allFieldIds.filter((id) => !fieldsInLayouts.has(id));
}

/**
 * Build a complete FormBuilderConfig from canvas items.
 * This creates the form "blueprint" that can be stored in table.smartTags.
 */
export function buildFormBuilderConfig(
	canvasItems: Array<{ type: 'field' | 'layout'; id: string; order: number }>,
	layouts: FormLayout[],
): FormBuilderConfig {
	// Sort items by order
	const sortedItems = [...canvasItems].sort((a, b) => a.order - b.order);

	// Build canvas order
	const canvasOrder: FormCanvasItem[] = sortedItems.map((item) =>
		item.type === 'field'
			? { type: 'field', fieldId: item.id, order: item.order }
			: { type: 'layout', layoutId: item.id, order: item.order },
	);

	return {
		version: 1,
		canvasOrder,
		layouts,
	};
}

export function filterLayoutsWithSavedFields(layouts: FormLayout[], savedFieldIds: Set<string>): FormLayout[] {
	return layouts
		.map((layout) => ({
			...layout,
			cells: layout.cells.map((cell) => ({
				...cell,
				fieldIds: cell.fieldIds.filter((id) => savedFieldIds.has(id)),
			})),
		}))
		.filter((layout) => layout.cells.some((cell) => cell.fieldIds.length > 0));
}

export function filterSavedLayouts(layouts: FormLayout[], savedFieldIds: Set<string>): FormLayout[] {
	return layouts.filter((layout) => {
		const fieldIds = getFieldIdsInLayout(layout);
		return fieldIds.some((id) => savedFieldIds.has(id));
	});
}

export function replaceFieldIdInLayouts(layouts: FormLayout[], oldFieldId: string, newFieldId: string): FormLayout[] {
	return layouts.map((layout) => ({
		...layout,
		cells: layout.cells.map((cell) => ({
			...cell,
			fieldIds: cell.fieldIds.map((id) => (id === oldFieldId ? newFieldId : id)),
		})),
	}));
}
