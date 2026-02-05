import { useState } from 'react';
import {
	defaultDropAnimationSideEffects,
	DragEndEvent,
	DragStartEvent,
	PointerSensor,
	rectIntersection,
	useSensor,
	useSensors,
	type CollisionDetection,
	type DropAnimation,
} from '@dnd-kit/core';

import type { FieldDefinition, FieldTypeInfo, FormLayoutColumns, TableDefinition } from '@/lib/schema';

import {
	applyFormBuilderTemplateToField,
	FORM_ELEMENT_LIBRARY,
	getFormBuilderFieldTypeInfo,
} from './element-library-registry';
import { parseLayoutCellDroppableId } from './layout-cell';
import { getLayoutTemplateById, isLayoutTemplateId, type LayoutTemplate } from './layout-registry';

export const FORM_BUILDER_DROPZONE_ID = 'form-builder-dropzone' as const;

export type DragSource = 'library' | 'canvas';

export interface FieldDragData {
	templateId?: string;
	source?: DragSource;
	isLayout?: boolean;
	columns?: FormLayoutColumns;
}

export const DEFAULT_DROP_ANIMATION: DropAnimation = {
	sideEffects: defaultDropAnimationSideEffects({
		styles: {
			active: {
				opacity: '0.5',
			},
		},
	}),
};

const totalElementCount = FORM_ELEMENT_LIBRARY.reduce((sum: number, cat) => sum + cat.templateIds.length, 0);

export function useFormBuilderDnD(currentTable: TableDefinition | null) {
	const [activeId, setActiveId] = useState<string | null>(null);
	const [draggedType, setDraggedType] = useState<FieldTypeInfo | null>(null);
	const [draggedLayoutTemplate, setDraggedLayoutTemplate] = useState<LayoutTemplate | null>(null);
	const [dragSource, setDragSource] = useState<DragSource | null>(null);
	const [draggedTemplateId, setDraggedTemplateId] = useState<string | null>(null);
	const [addFieldFn, setAddFieldFn] = useState<((field: FieldDefinition) => void) | null>(null);
	const [addLayoutFn, setAddLayoutFn] = useState<((columns: FormLayoutColumns) => void) | null>(null);
	const [addFieldToLayoutFn, setAddFieldToLayoutFn] = useState<
		((field: FieldDefinition, gridKey: string, columnIndex: number) => void) | null
	>(null);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
	);

	const handleDragStart = (event: DragStartEvent) => {
		const { active } = event;
		setActiveId(active.id as string);

		const data = active.data.current as FieldDragData | null;

		if (data?.templateId) {
			setDraggedTemplateId(data.templateId);
			setDragSource(data.source ?? 'library');

			// Check if it's a layout template
			if (data.isLayout && isLayoutTemplateId(data.templateId)) {
				const layoutTemplate = getLayoutTemplateById(data.templateId);
				setDraggedLayoutTemplate(layoutTemplate ?? null);
				setDraggedType(null);
			} else {
				// It's a field template
				const info = getFormBuilderFieldTypeInfo(data.templateId);
				setDraggedType(info ?? null);
				setDraggedLayoutTemplate(null);
			}
		}
	};

	// Custom collision detection that filters out invalid drop targets
	const customCollisionDetection: CollisionDetection = (args) => {
		const collisions = rectIntersection(args);

		// Allow drops on main drop zone and layout cells
		return collisions.filter((collision) => {
			const id = String(collision.id);
			return id === FORM_BUILDER_DROPZONE_ID || id.startsWith('layout-cell-');
		});
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { over } = event;

		if (!over || !currentTable) {
			resetDragState();
			return;
		}

		const overId = String(over.id);

		// Handle layout template drops on main drop zone
		if (draggedLayoutTemplate && overId === FORM_BUILDER_DROPZONE_ID && addLayoutFn) {
			addLayoutFn(draggedLayoutTemplate.columns);
			resetDragState();
			return;
		}

		// Handle field drops on layout cells
		const cellInfo = parseLayoutCellDroppableId(overId);
		if (cellInfo && draggedTemplateId && !draggedLayoutTemplate && addFieldToLayoutFn) {
			const baseField: FieldDefinition = {
				id: `temp-field-${Date.now()}`,
				name: '',
				type: 'text',
				label: draggedType?.label,
				description: '',
				constraints: { nullable: true },
				fieldOrder: 1000,
				metadata: { smartTags: {} },
			};
			const newField = applyFormBuilderTemplateToField(draggedTemplateId, baseField) as FieldDefinition;
			addFieldToLayoutFn(newField, cellInfo.gridKey, cellInfo.columnIndex);
			resetDragState();
			return;
		}

		// Handle field drops on main drop zone
		if (overId === FORM_BUILDER_DROPZONE_ID && draggedTemplateId && !draggedLayoutTemplate && addFieldFn) {
			const baseField: FieldDefinition = {
				id: `temp-field-${Date.now()}`,
				name: '',
				type: 'text',
				label: draggedType?.label,
				description: '',
				constraints: { nullable: true },
				fieldOrder: 1000,
				metadata: { smartTags: {} },
			};
			const newField = applyFormBuilderTemplateToField(draggedTemplateId, baseField) as FieldDefinition;
			addFieldFn(newField);
			resetDragState();
			return;
		}

		resetDragState();
	};

	const resetDragState = () => {
		setActiveId(null);
		setDraggedType(null);
		setDraggedLayoutTemplate(null);
		setDraggedTemplateId(null);
		setDragSource(null);
	};

	const handleAddFieldRef = (fn: (field: FieldDefinition) => void) => {
		setAddFieldFn(() => fn);
	};

	const handleAddLayoutRef = (fn: (columns: FormLayoutColumns) => void) => {
		setAddLayoutFn(() => fn);
	};

	const handleAddFieldToLayoutRef = (fn: (field: FieldDefinition, gridKey: string, columnIndex: number) => void) => {
		setAddFieldToLayoutFn(() => fn);
	};

	return {
		sensors,
		customCollisionDetection,
		handleDragStart,
		handleDragEnd,
		handleAddFieldRef,
		handleAddLayoutRef,
		handleAddFieldToLayoutRef,
		activeId,
		draggedType,
		draggedLayoutTemplate,
		dragSource,
		totalElementCount,
	};
}
