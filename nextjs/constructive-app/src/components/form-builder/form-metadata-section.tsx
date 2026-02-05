'use client';

import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@constructive-io/ui/button';
import { Textarea } from '@constructive-io/ui/textarea';
import { showErrorToast } from '@constructive-io/ui/toast';
import { Check, Eye, X } from 'lucide-react';

import { useSchemaBuilderSelectors, useUpdateTable } from '@/lib/gql/hooks/schema-builder';
import { cn } from '@/lib/utils';

interface FormMetadataSectionProps {
	onPreview?: () => void;
}

export function FormMetadataSection({ onPreview }: FormMetadataSectionProps) {
	const { currentTable } = useSchemaBuilderSelectors();
	const updateTableMutation = useUpdateTable();

	const [localDescription, setLocalDescription] = useState(currentTable?.description || '');
	const [isEditingDescription, setIsEditingDescription] = useState(false);
	const descriptionInputRef = useRef<HTMLTextAreaElement>(null);

	// Sync local state when table changes
	useEffect(() => {
		setLocalDescription(currentTable?.description || '');
		setIsEditingDescription(false);
	}, [currentTable?.id, currentTable?.description]);

	const handleStartEdit = () => {
		setIsEditingDescription(true);
		setTimeout(() => {
			descriptionInputRef.current?.focus();
			descriptionInputRef.current?.select();
		}, 0);
	};

	const handleSave = async () => {
		if (!currentTable?.id) return;

		const trimmed = localDescription.trim();
		const description = trimmed === '' ? null : trimmed;

		try {
			await updateTableMutation.mutateAsync({
				id: currentTable.id,
				description,
			});
			setIsEditingDescription(false);
		} catch (error) {
			console.error('Failed to save description:', error);
			showErrorToast({
				message: 'Failed to save description',
				description: error instanceof Error ? error.message : 'An unexpected error occurred.',
			});
		}
	};

	const isSaving = updateTableMutation.isPending;

	const handleCancel = () => {
		setLocalDescription(currentTable?.description || '');
		setIsEditingDescription(false);
	};

	return (
		<div className='mx-auto w-full max-w-3xl px-3'>
			{/* Form Title - Readonly */}
			<div className='flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3'>
				<h1 className='text-foreground text-3xl font-bold tracking-tight'>{currentTable?.name || 'Untitled Form'}</h1>
				{typeof onPreview === 'function' && (
					<Button variant='outline' size='sm' onClick={onPreview} className='shrink-0 gap-2 self-end sm:self-auto'>
						<Eye className='h-3.5 w-3.5' />
						Preview
					</Button>
				)}
			</div>

			{/* Form Description - Click to edit */}
			<div className='mt-2'>
				{isEditingDescription ? (
					<form
						className='space-y-2'
						onSubmit={(e) => {
							e.preventDefault();
							if (!isSaving) {
								handleSave();
							}
						}}
					>
						<Textarea
							ref={descriptionInputRef}
							value={localDescription}
							onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setLocalDescription(e.target.value)}
							placeholder='Add a description to help people understand your form'
							disabled={isSaving}
							className='min-h-[60px] resize-none text-base'
							onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
								if (e.key === 'Escape') {
									e.preventDefault();
									handleCancel();
								}
								if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
									e.preventDefault();
									handleSave();
								}
							}}
						/>
						<div className='flex items-center gap-2'>
							<Button variant='default' size='sm' type='submit' className='h-7 gap-1.5 px-2' disabled={isSaving}>
								<Check className='h-3.5 w-3.5' />
								{isSaving ? 'Saving...' : 'Save'}
							</Button>
							<Button
								variant='ghost'
								size='sm'
								type='button'
								onClick={handleCancel}
								className='h-7 gap-1.5 px-2'
								disabled={isSaving}
							>
								<X className='h-3.5 w-3.5' />
								Cancel
							</Button>
						</div>
					</form>
				) : (
					<p
						onClick={handleStartEdit}
						className={cn(
							'-mx-1 cursor-pointer rounded px-1 py-0.5 text-base transition-colors',
							'hover:bg-muted/50',
							localDescription ? 'text-muted-foreground' : 'text-muted-foreground/60 italic',
						)}
					>
						{localDescription || 'Add a description to help people understand your form'}
					</p>
				)}
			</div>
		</div>
	);
}
