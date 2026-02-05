'use client';

import { useDroppable } from '@dnd-kit/core';
import { Plus } from 'lucide-react';

import type { UINode } from '@/lib/form-builder';
import { cn } from '@/lib/utils';

import { FormElementWrapper } from './form-element-wrapper';

export const LAYOUT_CELL_DROPPABLE_PREFIX = 'layout-cell-' as const;

export function getLayoutCellDroppableId(gridKey: string, columnIndex: number): string {
	return `${LAYOUT_CELL_DROPPABLE_PREFIX}${gridKey}-${columnIndex}`;
}

export function parseLayoutCellDroppableId(droppableId: string): { gridKey: string; columnIndex: number } | null {
	if (!droppableId.startsWith(LAYOUT_CELL_DROPPABLE_PREFIX)) return null;
	const rest = droppableId.slice(LAYOUT_CELL_DROPPABLE_PREFIX.length);
	const lastDashIndex = rest.lastIndexOf('-');
	if (lastDashIndex === -1) return null;
	const gridKey = rest.slice(0, lastDashIndex);
	const columnIndex = parseInt(rest.slice(lastDashIndex + 1), 10);
	if (isNaN(columnIndex)) return null;
	return { gridKey, columnIndex };
}

interface LayoutCellProps {
	gridKey: string;
	columnIndex: number;
	nodes: UINode[];
	selectedFieldId: string | null;
	onSelectField: (fieldId: string) => void;
	onEditField: (fieldId: string) => void;
	onCopyField: (fieldId: string) => void;
	onDeleteField: (fieldId: string) => void;
	onSaveField: (fieldId: string) => void;
	hasFieldUnsavedChanges: (fieldId: string) => boolean;
	pendingDeleteId: string | null;
	isSaving: boolean;
	fieldRefs: React.MutableRefObject<Map<string, HTMLDivElement>>;
}

export function LayoutCell({
	gridKey,
	columnIndex,
	nodes,
	selectedFieldId,
	onSelectField,
	onEditField,
	onCopyField,
	onDeleteField,
	onSaveField,
	hasFieldUnsavedChanges,
	pendingDeleteId,
	isSaving,
	fieldRefs,
}: LayoutCellProps) {
	const droppableId = getLayoutCellDroppableId(gridKey, columnIndex);
	const { setNodeRef, isOver } = useDroppable({
		id: droppableId,
		data: {
			type: 'layout-cell',
			gridKey,
			columnIndex,
		},
	});

	const isEmpty = nodes.length === 0;

	return (
		<div
			ref={setNodeRef}
			className={cn(
				'relative min-h-[80px] rounded-md border-2 border-dashed p-2 transition-all',
				isOver ? 'border-primary bg-primary/5' : 'border-border/50',
				isEmpty && 'flex items-center justify-center',
			)}
		>
			{isEmpty ? (
				<div className='text-muted-foreground flex flex-col items-center gap-1 text-xs'>
					<Plus className='h-4 w-4' />
					<span>Drop element</span>
				</div>
			) : (
				<div className='space-y-2'>
					{nodes.map((node) => {
						const fieldId = node.props.fieldId as string;
						return (
							<div
								key={node.key}
								ref={(el) => {
									if (el) {
										fieldRefs.current.set(fieldId, el);
									} else {
										fieldRefs.current.delete(fieldId);
									}
								}}
							>
								<FormElementWrapper
									node={node}
									isSelected={selectedFieldId === fieldId}
									hasUnsavedChanges={hasFieldUnsavedChanges(fieldId)}
									onSelect={() => onSelectField(fieldId)}
									onEdit={() => onEditField(fieldId)}
									onCopy={() => onCopyField(fieldId)}
									onDelete={() => onDeleteField(fieldId)}
									onSave={() => onSaveField(fieldId)}
									isDeleting={pendingDeleteId === fieldId}
									isSaving={isSaving && selectedFieldId === fieldId}
									compact
								/>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
