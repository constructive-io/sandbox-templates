import { CSSProperties } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { RiCloseLine, RiDraggable } from '@remixicon/react';

import { useConditionBuilderContext } from './builder-context';
import type { ConditionLeafNode } from './types';

interface ConditionRowProps<TData> {
	leaf: ConditionLeafNode<TData>;
	index: number;
}

export function ConditionRow<TData>({ leaf, index }: ConditionRowProps<TData>) {
	const ctx = useConditionBuilderContext<TData>();
	const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
		id: leaf.id,
		data: { type: 'condition' },
	});

	const style: CSSProperties = transform
		? {
				transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
			}
		: {};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={`bg-card border-border/60 relative flex items-center gap-2 rounded-lg border px-3 py-2 shadow-sm ${
				isDragging ? 'ring-primary opacity-70 ring-2' : ''
			}`}
		>
			<button
				type='button'
				className='text-muted-foreground hover:text-foreground flex h-6 w-6 cursor-grab items-center justify-center
					transition-colors'
				{...listeners}
				{...attributes}
			>
				<RiDraggable className='size-4' />
			</button>

			<div className='flex-1'>
				{ctx.renderCondition(leaf, {
					path: [],
					groupOperator: ctx.value.operator,
					index,
					node: leaf,
				})}
			</div>

			<button
				type='button'
				onClick={() => ctx.onDeleteNode(leaf.id)}
				aria-label='Delete condition'
				className='text-muted-foreground/60 hover:text-destructive flex h-6 w-6 cursor-pointer items-center
					justify-center transition-colors'
			>
				<RiCloseLine className='size-4' />
			</button>
		</div>
	);
}
