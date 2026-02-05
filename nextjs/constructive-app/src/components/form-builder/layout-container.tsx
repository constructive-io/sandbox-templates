'use client';

import { useMemo, useState } from 'react';
import { Button } from '@constructive-io/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@constructive-io/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@constructive-io/ui/tooltip';
import { Loader2, Trash2 } from 'lucide-react';

import type { UINode } from '@/lib/form-builder';
import { cn } from '@/lib/utils';

import { LayoutCell } from './layout-cell';

interface LayoutContainerProps {
	gridNode: UINode;
	selectedFieldId: string | null;
	onSelectField: (fieldId: string) => void;
	onEditField: (fieldId: string) => void;
	onCopyField: (fieldId: string) => void;
	onDeleteField: (fieldId: string) => void;
	onSaveField: (fieldId: string) => void;
	onDeleteGrid: (gridKey: string, fieldIds: string[]) => void | Promise<void>;
	hasFieldUnsavedChanges: (fieldId: string) => boolean;
	pendingDeleteId: string | null;
	isSaving: boolean;
	fieldRefs: React.MutableRefObject<Map<string, HTMLDivElement>>;
}

export function LayoutContainer({
	gridNode,
	selectedFieldId,
	onSelectField,
	onEditField,
	onCopyField,
	onDeleteField,
	onSaveField,
	onDeleteGrid,
	hasFieldUnsavedChanges,
	pendingDeleteId,
	isSaving,
	fieldRefs,
}: LayoutContainerProps) {
	const [isConfirmOpen, setIsConfirmOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const columns = (gridNode.props.columns as 2 | 3 | 4) || 2;

	const gridColsClass = {
		2: 'grid-cols-2',
		3: 'grid-cols-3',
		4: 'grid-cols-4',
	}[columns];

	const fieldIds = useMemo(() => {
		const ids: string[] = [];
		for (const column of gridNode.children) {
			for (const fieldNode of column.children) {
				if (fieldNode.props.fieldId) {
					ids.push(fieldNode.props.fieldId as string);
				}
			}
		}
		return ids;
	}, [gridNode.children]);

	const isEmpty = fieldIds.length === 0;

	return (
		<div className={cn('group/layout relative rounded-lg border p-3 transition-all', 'hover:border-border')}>
			<div className='mb-2 flex items-center justify-between'>
				<span className='text-muted-foreground text-xs font-medium'>
					{columns} Column{columns > 1 ? 's' : ''} Layout
				</span>
				{isEmpty ? (
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant='ghost'
								size='sm'
								className='text-destructive hover:text-destructive h-6 w-6 p-0 opacity-100 transition-opacity'
								disabled={isDeleting}
								onClick={async () => {
									setIsDeleting(true);
									try {
										await onDeleteGrid(gridNode.key, []);
									} finally {
										setIsDeleting(false);
									}
								}}
							>
								{isDeleting ? <Loader2 className='h-3.5 w-3.5 animate-spin' /> : <Trash2 className='h-3.5 w-3.5' />}
							</Button>
						</TooltipTrigger>
						<TooltipContent side='top'>
							<p>Remove layout</p>
						</TooltipContent>
					</Tooltip>
				) : (
					<Popover open={isConfirmOpen} onOpenChange={(open) => (!isDeleting ? setIsConfirmOpen(open) : undefined)}>
						<Tooltip>
							<TooltipTrigger asChild>
								<PopoverTrigger asChild>
									<Button
										variant='ghost'
										size='sm'
										className='text-destructive hover:text-destructive h-6 w-6 p-0 opacity-0 transition-opacity
											group-hover/layout:opacity-100'
										disabled={isDeleting}
										onClick={(e) => {
											e.preventDefault();
											if (!isDeleting) setIsConfirmOpen(true);
										}}
									>
										<Trash2 className='h-3.5 w-3.5' />
									</Button>
								</PopoverTrigger>
							</TooltipTrigger>
							<TooltipContent side='top'>
								<p>Remove layout</p>
							</TooltipContent>
						</Tooltip>
						<PopoverContent side='top' align='end' className='w-64 p-3'>
							<div className='space-y-2'>
								<div className='text-sm font-medium'>Delete layout?</div>
								<div className='text-muted-foreground text-xs'>This will delete all fields inside this layout.</div>
								<div className='flex justify-end gap-2 pt-1'>
									<Button variant='ghost' size='sm' disabled={isDeleting} onClick={() => setIsConfirmOpen(false)}>
										Cancel
									</Button>
									<Button
										variant='destructive'
										size='sm'
										disabled={isDeleting}
										onClick={async () => {
											setIsDeleting(true);
											try {
												await onDeleteGrid(gridNode.key, fieldIds);
											} finally {
												setIsDeleting(false);
												setIsConfirmOpen(false);
											}
										}}
									>
										{isDeleting ? (
											<span className='inline-flex items-center gap-2'>
												<Loader2 className='h-3.5 w-3.5 animate-spin' />
												Deleting
											</span>
										) : (
											'Delete'
										)}
									</Button>
								</div>
							</div>
						</PopoverContent>
					</Popover>
				)}
			</div>

			<div className={cn('bg-muted/30 grid gap-2', gridColsClass)}>
				{isDeleting ? (
					<div className={cn('col-span-full flex items-center justify-center py-6')}>
						<div className='text-muted-foreground flex items-center gap-2 text-sm'>
							<Loader2 className='h-4 w-4 animate-spin' />
							Deleting layout…
						</div>
					</div>
				) : null}
				{gridNode.children.map((column, columnIndex) => {
					if (isDeleting) return null;
					return (
						<LayoutCell
							key={column.key}
							gridKey={gridNode.key}
							columnIndex={columnIndex}
							nodes={column.children}
							selectedFieldId={selectedFieldId}
							onSelectField={onSelectField}
							onEditField={onEditField}
							onCopyField={onCopyField}
							onDeleteField={onDeleteField}
							onSaveField={onSaveField}
							hasFieldUnsavedChanges={hasFieldUnsavedChanges}
							pendingDeleteId={pendingDeleteId}
							isSaving={isSaving}
							fieldRefs={fieldRefs}
						/>
					);
				})}
			</div>
		</div>
	);
}
