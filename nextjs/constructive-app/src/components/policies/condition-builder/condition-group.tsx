import { cn } from '@/lib/utils';

import { AddConditionButton } from './add-condition-button';
import { useConditionBuilderContext } from './builder-context';
import { ConditionRow } from './condition-row';
import { DropZone } from './drop-zone';
import { Rails } from './rails';
import type { ConditionGroupNode, ConditionLeafNode } from './types';

interface ConditionGroupProps<TData> {
	group: ConditionGroupNode<TData>;
	depth?: number;
}

export function ConditionGroup<TData>({ group, depth = 0 }: ConditionGroupProps<TData>) {
	const ctx = useConditionBuilderContext<TData>();
	const lastChild = group.children[group.children.length - 1];
	const depthBg = ['bg-muted/10', 'bg-muted/30', 'bg-muted/50', 'bg-muted/70'][Math.min(depth, 3)];
	const isAll = group.operator === 'AND';
	const isAny = !isAll;

	return (
		<div className={cn('space-y-1 rounded-xl p-3', depthBg)}>
			<div className='flex items-center gap-2'>
				<div className='bg-background inline-flex rounded-lg border p-0.5 text-xs font-semibold shadow-sm'>
					<button
						type='button'
						onClick={() => {
							if (!isAny) ctx.onToggleGroupOperator(group.id);
						}}
						className={cn(
							'cursor-pointer rounded-lg px-2 py-1',
							isAny ? 'bg-amber-500 text-white' : 'text-muted-foreground bg-transparent',
						)}
					>
						ANY
					</button>
					<button
						type='button'
						onClick={() => {
							if (!isAll) ctx.onToggleGroupOperator(group.id);
						}}
						className={cn(
							'cursor-pointer rounded-lg px-2 py-1',
							isAll ? 'bg-primary text-primary-foreground' : 'text-muted-foreground bg-transparent',
						)}
					>
						ALL
					</button>
				</div>
				<span className='text-muted-foreground text-sm'>of the following are true:</span>
			</div>
			<div className='flex gap-2 pl-6'>
				<Rails isAny={group.operator === 'OR'} />
				<div className='flex-1 space-y-1'>
					{group.children.map((child, index) => {
						if (child.type === 'group') {
							return (
								<div key={child.id} className='space-y-1'>
									<DropZone id={`${child.id}-before`} targetId={child.id} position='before' targetType='group' />
									<DropZone id={`${child.id}-into`} targetId={child.id} position='into' targetType='group'>
										<ConditionGroup group={child} depth={depth + 1} />
									</DropZone>
								</div>
							);
						}
						return (
							<div key={child.id} className='space-y-1'>
								<DropZone id={`${child.id}-before`} targetId={child.id} position='before' targetType='condition' />
								<DropZone id={`${child.id}-into`} targetId={child.id} position='into' targetType='condition'>
									<ConditionRow leaf={child as ConditionLeafNode<TData>} index={index} />
								</DropZone>
							</div>
						);
					})}
					{lastChild && (
						<DropZone
							id={`${group.id}-after-last`}
							targetId={lastChild.id}
							position='after'
							targetType={lastChild.type}
						/>
					)}
					<AddConditionButton onClick={() => ctx.onAddConditionToGroup(group.id)} />
				</div>
			</div>
		</div>
	);
}
