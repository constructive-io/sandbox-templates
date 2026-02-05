import { useState } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';

import { ConditionBuilderProvider } from './builder-context';
import { ConditionGroup } from './condition-group';
import {
	deleteNode,
	findNode,
	groupTwoConditions,
	insertNewCondition,
	moveNode,
	toggleGroupOperator,
} from './tree-utils';
import type { ConditionBuilderProps, ConditionNodeId } from './types';

export function ConditionBuilder<TData>(props: ConditionBuilderProps<TData>) {
	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
	const [activeId, setActiveId] = useState<ConditionNodeId | null>(null);

	const handleDragStart = (event: DragStartEvent) => {
		setActiveId(event.active.id as ConditionNodeId);
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		setActiveId(null);
		if (!over) return;

		const sourceId = active.id as ConditionNodeId;
		const { targetId, position, targetType } = (over.data.current || {}) as {
			targetId?: ConditionNodeId;
			position?: 'before' | 'after' | 'into';
			targetType?: 'condition' | 'group';
		};

		if (!targetId || !position) return;

		let next = props.value;
		if (position === 'into') {
			if (targetType === 'group') {
				const targetNode = findNode(next, targetId);
				if (targetNode && targetNode.type === 'group') {
					next = moveNode(next, sourceId, targetId, 'into');
				}
			} else if (targetType === 'condition') {
				next = groupTwoConditions(next, sourceId, targetId, 'AND');
			}
		} else {
			next = moveNode(next, sourceId, targetId, position);
		}

		if (next !== props.value) {
			props.onChange(next);
		}
	};

	const ctxValue = {
		...props,
		activeId,
		onDeleteNode: (id: ConditionNodeId) => {
			props.onChange(deleteNode(props.value, id));
		},
		onToggleGroupOperator: (groupId: ConditionNodeId) => {
			props.onChange(toggleGroupOperator(props.value, groupId));
		},
		onAddConditionToGroup: (groupId: ConditionNodeId) => {
			props.onChange(insertNewCondition(props.value, groupId, props.getNewCondition));
		},
		onMoveNode: (sourceId: ConditionNodeId, targetId: ConditionNodeId, position: 'before' | 'after' | 'into') => {
			let next = props.value;
			if (position === 'into') {
				const targetNode = findNode(next, targetId);
				if (targetNode && targetNode.type === 'group') {
					next = moveNode(next, sourceId, targetId, 'into');
				}
			} else {
				next = moveNode(next, sourceId, targetId, position);
			}
			props.onChange(next);
		},
		isDraggingId: (id: ConditionNodeId) => activeId === id,
	};

	return (
		<DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
			<ConditionBuilderProvider value={ctxValue}>
				<ConditionGroup group={props.value} />
			</ConditionBuilderProvider>
		</DndContext>
	);
}
