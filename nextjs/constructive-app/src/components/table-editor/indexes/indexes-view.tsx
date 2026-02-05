'use client';

import { useState } from 'react';
import { Button } from '@constructive-io/ui/button';
import { useCardStack } from '@constructive-io/ui/stack';
import { toast } from '@constructive-io/ui/toast';
import { Tooltip, TooltipContent, TooltipTrigger } from '@constructive-io/ui/tooltip';
import { Database, ListChecks, Loader2, Plus, Table2, Trash2 } from 'lucide-react';

import { useSchemaBuilderSelectors } from '@/lib/gql/hooks/schema-builder';
import { useDeleteIndex } from '@/lib/gql/hooks/schema-builder/use-index-mutations';
import type { IndexDefinition } from '@/lib/schema';
import { INDEX_TYPE_LABELS } from '@/lib/schema';
import { CARD_WIDTHS } from '@/lib/stack/card-widths';
import { cn } from '@/lib/utils';

import { IndexCard } from '../index-card';
import { IndexEmptyState } from './index-empty-state';

const FIELD_SUMMARY_LIMIT = 4;

function buildFieldSummary(
	fieldIds: string[],
	tableFields: { id: string; name: string }[],
	limit = FIELD_SUMMARY_LIMIT,
) {
	const fieldNameList = fieldIds
		.map((fieldId) => tableFields.find((field) => field.id === fieldId)?.name || fieldId)
		.filter(Boolean);
	const visibleFields = fieldNameList.slice(0, limit);
	const remainingCount = Math.max(fieldNameList.length - visibleFields.length, 0);
	const hasFields = fieldNameList.length > 0;
	const fieldSummary = hasFields
		? `${visibleFields.join(', ')}${remainingCount > 0 ? `, +${remainingCount} more` : ''}`
		: 'None';

	return {
		fieldSummary,
		fieldNameList,
		hasFields,
	};
}

function NoTableSelectedState() {
	return (
		<div className='flex min-h-0 flex-1 flex-col items-center justify-center p-6'>
			<div className='bg-muted/50 mb-4 flex h-16 w-16 items-center justify-center rounded-full'>
				<Table2 className='text-muted-foreground h-8 w-8' />
			</div>
			<h3 className='mb-1 text-lg font-semibold'>No table selected</h3>
			<p className='text-muted-foreground max-w-sm text-center text-sm'>
				Select a table from the sidebar to view and manage its indexes.
			</p>
		</div>
	);
}

export function IndexesView() {
	const [deletingId, setDeletingId] = useState<string | null>(null);

	const stack = useCardStack();
	const { currentTable } = useSchemaBuilderSelectors();
	const deleteIndexMutation = useDeleteIndex();

	// No table selected state
	if (!currentTable) {
		return <NoTableSelectedState />;
	}

	const indexes = currentTable.indexes || [];
	const hasIndexes = indexes.length > 0;

	const handleOpenCreate = () => {
		stack.push({
			id: 'index-new',
			title: 'Create Index',
			Component: IndexCard,
			props: { editingIndex: null },
			width: CARD_WIDTHS.medium,
		});
	};

	const handleOpenEdit = (index: IndexDefinition) => {
		stack.push({
			id: `index-${index.id}`,
			title: 'Edit Index',
			Component: IndexCard,
			props: { editingIndex: index },
			width: CARD_WIDTHS.medium,
		});
	};

	const handleDelete = async (indexId: string) => {
		setDeletingId(indexId);
		try {
			await deleteIndexMutation.mutateAsync({ id: indexId });
			toast.success({
				message: 'Index deleted',
				description: 'The index has been successfully deleted',
			});
		} catch (error) {
			toast.error({
				message: 'Failed to delete index',
				description: error instanceof Error ? error.message : 'An error occurred',
			});
		} finally {
			setDeletingId(null);
		}
	};

	return (
		<div className='flex min-h-0 flex-1 flex-col overflow-auto p-6'>
			{!hasIndexes ? (
				<IndexEmptyState onCreateClick={handleOpenCreate} tableName={currentTable.name} />
			) : (
				<div className='mx-auto w-full max-w-4xl space-y-6'>
					{/* Header */}
					<div className='flex items-center justify-between'>
						<div>
							<h2 className='text-xl font-semibold tracking-tight'>Indexes</h2>
							<p className='text-muted-foreground mt-1 text-sm'>
								{indexes.length} index{indexes.length !== 1 ? 'es' : ''} on{' '}
								<code className='bg-muted rounded px-1.5 py-0.5 font-mono text-xs'>{currentTable.name}</code>
							</p>
						</div>
						<Button onClick={handleOpenCreate}>
							<Plus className='mr-2 h-4 w-4' />
							Add Index
						</Button>
					</div>

					{/* Index Cards */}
					<div className='space-y-3'>
						{indexes.map((index) => {
							const isDeleting = deletingId === index.id;
							const { fieldSummary, fieldNameList, hasFields } = buildFieldSummary(index.fields, currentTable.fields);

							return (
								<div
									key={index.id}
									onClick={() => !isDeleting && handleOpenEdit(index)}
									className={cn(
										'group relative cursor-pointer rounded-xl border p-4 transition-all duration-200',
										'border-border/60 hover:border-border/80 hover:bg-muted/30',
										isDeleting && 'pointer-events-none opacity-50',
									)}
								>
									{/* Header: Name + Type Pill + Delete */}
									<div className='flex items-center justify-between'>
										<div className='flex items-center gap-2'>
											<ListChecks className='text-muted-foreground h-4 w-4' />
											<p className='truncate text-sm font-semibold'>{index.name || 'Unnamed index'}</p>
											<span
												className={cn(
													'rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase',
													'border border-blue-500/30 bg-blue-500/10 text-blue-400',
												)}
											>
												{INDEX_TYPE_LABELS[index.type ?? 'btree'] ?? index.type ?? 'B-tree'}
											</span>
											{index.unique && (
												<span
													className={cn(
														'rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase',
														'border border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
													)}
												>
													Unique
												</span>
											)}
										</div>
										<Button
											variant='ghost'
											size='sm'
											className='text-muted-foreground hover:text-destructive hover:bg-destructive/10 mr-2 h-8 w-8
												shrink-0 p-0'
											onClick={(e) => {
												e.stopPropagation();
												handleDelete(index.id);
											}}
											disabled={isDeleting}
										>
											{isDeleting ? <Loader2 className='h-4 w-4 animate-spin' /> : <Trash2 className='h-4 w-4' />}
										</Button>
									</div>

									{/* Fields */}
									<div className='mt-3 flex items-center gap-3'>
										<div className='bg-background rounded-md border px-3 py-1.5 font-mono text-sm'>
											{hasFields ? (
												<Tooltip>
													<TooltipTrigger asChild>
														<span className='inline-flex items-center gap-1.5'>
															<Database className='h-3.5 w-3.5 opacity-50' />
															<span className='text-foreground'>{fieldSummary}</span>
														</span>
													</TooltipTrigger>
													<TooltipContent className='max-w-xs'>{fieldNameList.join(', ')}</TooltipContent>
												</Tooltip>
											) : (
												<span className='text-muted-foreground inline-flex items-center gap-1.5'>
													<Database className='h-3.5 w-3.5 opacity-50' />
													No fields
												</span>
											)}
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}
