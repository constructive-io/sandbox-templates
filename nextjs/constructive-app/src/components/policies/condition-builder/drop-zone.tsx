import { ReactNode } from 'react';
import { useDroppable } from '@dnd-kit/core';

import type { DropPosition } from './tree-utils';
import type { ConditionNodeId } from './types';

type TargetType = 'condition' | 'group';

interface DropZoneProps {
	id: string;
	targetId: ConditionNodeId;
	position: DropPosition;
	targetType?: TargetType;
	children?: ReactNode;
}

export function DropZone({ id, targetId, position, targetType, children }: DropZoneProps) {
	const { isOver, setNodeRef } = useDroppable({
		id,
		data: {
			targetId,
			position,
			targetType,
		},
	});

	return (
		<div ref={setNodeRef} className={`relative ${position === 'into' ? 'block' : 'h-2'}`}>
			{position !== 'into' && (
				<div
					className={`pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-dashed
					transition-colors ${isOver ? 'border-primary' : 'border-transparent'}`}
				/>
			)}
			{position === 'into' && (
				<div className={`relative ${isOver ? 'ring-primary/40 rounded-lg ring-2' : ''}`}>{children}</div>
			)}
		</div>
	);
}
