'use client';

import { useState } from 'react';
import { Button } from '@constructive-io/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@constructive-io/ui/tooltip';
import { Check, Copy, Loader2, Pencil, Trash2 } from 'lucide-react';

import type { UINode } from '@/lib/form-builder';
import { FieldNodePreview } from '@/lib/form-renderer';
import { cn } from '@/lib/utils';

export interface FormElementWrapperProps {
	node: UINode;
	isSelected: boolean;
	hasUnsavedChanges?: boolean;
	onSelect: () => void;
	onEdit: () => void;
	onCopy: () => void;
	onDelete: () => void;
	onSave?: () => void;
	isDeleting?: boolean;
	isSaving?: boolean;
	compact?: boolean;
}

export function FormElementWrapper({
	node,
	isSelected,
	hasUnsavedChanges = false,
	onSelect,
	onEdit,
	onCopy,
	onDelete,
	onSave,
	isDeleting = false,
	isSaving = false,
	compact = false,
}: FormElementWrapperProps) {
	const [isHovered, setIsHovered] = useState(false);

	const showControls = isHovered || isSelected || isDeleting;

	return (
		<div
			className={cn(
				'group bg-card relative rounded-lg border-2 transition-all duration-150',
				compact ? 'p-2' : 'p-3 pt-2',
				showControls ? 'z-30' : 'z-0',
				hasUnsavedChanges
					? isSelected
						? 'border-amber-400 ring-2 ring-amber-400/20'
						: 'border-amber-400'
					: isSelected
						? 'border-primary ring-primary/20 ring-2'
						: isHovered
							? 'border-primary/50'
							: 'hover:border-border/60 border-transparent',
				isDeleting && 'pointer-events-none opacity-50',
			)}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			{/* Unsaved Changes Indicator */}
			{hasUnsavedChanges && (
				<div
					className='absolute -top-2.5 right-3 rounded bg-amber-400 px-1.5 py-0.5 text-[10px] font-medium
						text-amber-950'
				>
					{String(node.props.fieldId).startsWith('temp-field-') ? 'Unsaved field' : 'Unsaved changes'}
				</div>
			)}

			<FieldNodePreview node={node} />

			{/* Control Icons - Positioned at bottom right */}
			{showControls && (
				<div
					className={cn(
						`bg-background absolute right-4 -bottom-3 z-30 flex items-center gap-1 rounded-md border px-1 py-0.5
						shadow-sm`,
						'animate-in fade-in-0 zoom-in-95 duration-150',
					)}
					onClick={(e) => e.stopPropagation()}
				>
					{!isDeleting && (
						<>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant='ghost'
										size='sm'
										className='h-7 w-7 p-0'
										onClick={(e) => {
											e.stopPropagation();
											onCopy();
										}}
									>
										<Copy className='h-3.5 w-3.5' />
									</Button>
								</TooltipTrigger>
								<TooltipContent side='bottom'>
									<p>Duplicate</p>
								</TooltipContent>
							</Tooltip>

							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant='ghost'
										size='sm'
										className='h-7 w-7 p-0'
										onClick={(e) => {
											e.stopPropagation();
											onEdit();
										}}
									>
										<Pencil className='h-3.5 w-3.5' />
									</Button>
								</TooltipTrigger>
								<TooltipContent side='bottom'>
									<p>Edit</p>
								</TooltipContent>
							</Tooltip>
						</>
					)}

					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant='ghost'
								size='sm'
								className='text-destructive hover:text-destructive h-7 w-7 p-0'
								onClick={(e) => {
									e.stopPropagation();
									onDelete();
								}}
								disabled={isDeleting}
							>
								{isDeleting ? <Loader2 className='h-3.5 w-3.5 animate-spin' /> : <Trash2 className='h-3.5 w-3.5' />}
							</Button>
						</TooltipTrigger>
						<TooltipContent side='bottom'>
							<p>Delete</p>
						</TooltipContent>
					</Tooltip>

					{/* Save button - only show when there are unsaved changes */}
					{!isDeleting && hasUnsavedChanges && onSave && (
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant='ghost'
									size='sm'
									className='h-7 w-7 p-0 text-green-600 hover:text-green-600'
									onClick={(e) => {
										e.stopPropagation();
										onSave();
									}}
									disabled={isSaving}
								>
									{isSaving ? <Loader2 className='h-3.5 w-3.5 animate-spin' /> : <Check className='h-3.5 w-3.5' />}
								</Button>
							</TooltipTrigger>
							<TooltipContent side='bottom'>
								<p>Save</p>
							</TooltipContent>
						</Tooltip>
					)}
				</div>
			)}
		</div>
	);
}
