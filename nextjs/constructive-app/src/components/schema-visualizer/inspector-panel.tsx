'use client';

import { useMemo, useState } from 'react';
import { RiCloseLine, RiKey2Line, RiLinksLine, RiDeleteBinLine, RiEditLine } from '@remixicon/react';
import { motion, AnimatePresence } from 'motion/react';

import { useCardStack } from '@constructive-io/ui/stack';
import { Button } from '@constructive-io/ui/button';
import { ScrollArea } from '@constructive-io/ui/scroll-area';
import { Separator } from '@constructive-io/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@constructive-io/ui/tooltip';
import { Badge } from '@constructive-io/ui/badge';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@constructive-io/ui/alert-dialog';
import { showSuccessToast, showErrorToast } from '@constructive-io/ui/toast';

import { useDeleteIndex } from '@/lib/gql/hooks/schema-builder';
import { useDeleteForeignKey } from '@/lib/gql/hooks/schema-builder/use-relationship-mutations';

import { cn } from '@/lib/utils';
import { CARD_WIDTHS } from '@/lib/stack/card-widths';
import {
	ForeignKeyActionLabels,
	RelationshipTypeLabels,
	type TableDefinition,
	type RelationshipDefinition,
	type FieldDefinition,
	type IndexDefinition,
	type ForeignKeyConstraint,
} from '@/lib/schema';

import { RelationshipCard } from '@/components/table-editor/relationships';
import { IndexCard } from '@/components/table-editor/index-card';
import { useVisualizerContext } from './visualizer-context';
import { FieldCard } from './field-card';

interface InspectorPanelProps {
	className?: string;
}

export function InspectorPanel({ className }: InspectorPanelProps) {
	const { panelMode, selectedTable, selectedRelationship, closePanel } = useVisualizerContext();

	const showPanel = panelMode !== 'none';

	return (
		<AnimatePresence>
			{showPanel && (
				<motion.div
					initial={{ width: 0, opacity: 0 }}
					animate={{ width: 320, opacity: 1 }}
					exit={{ width: 0, opacity: 0 }}
					transition={{ type: 'spring', stiffness: 400, damping: 35 }}
					className={cn('border-border bg-background flex h-full flex-col overflow-hidden border-l', className)}
				>
					{panelMode === 'table-details' && selectedTable && (
						<TableDetailsPanel table={selectedTable} onClose={closePanel} />
					)}
					{panelMode === 'relationship-details' && selectedRelationship && (
						<RelationshipDetailsPanel relationship={selectedRelationship} onClose={closePanel} />
					)}
					{panelMode === 'create-table' && <CreateTablePanel onClose={closePanel} />}
					{panelMode === 'create-relationship' && <CreateRelationshipPanel onClose={closePanel} />}
				</motion.div>
			)}
		</AnimatePresence>
	);
}

// ============================================================================
// Table Details Panel
// ============================================================================

interface TableDetailsPanelProps {
	table: TableDefinition;
	onClose: () => void;
}

function TableDetailsPanel({ table, onClose }: TableDetailsPanelProps) {
	const stack = useCardStack();

	// Separate fields by type
	const { primaryFields, foreignFields, regularFields } = useMemo(() => {
		const primary: FieldDefinition[] = [];
		const foreign: FieldDefinition[] = [];
		const regular: FieldDefinition[] = [];

		for (const field of table.fields) {
			if (field.constraints.primaryKey) {
				primary.push(field);
			} else if (field.metadata?.targetTable) {
				foreign.push(field);
			} else {
				regular.push(field);
			}
		}

		return { primaryFields: primary, foreignFields: foreign, regularFields: regular };
	}, [table.fields]);

	// Convert ForeignKeyConstraint from table.constraints to use in RelationshipCard
	const handleEditRelationship = (constraint: ForeignKeyConstraint) => {
		stack.push({
			id: `edit-relationship-${constraint.id}`,
			title: 'Edit Relationship',
			Component: RelationshipCard,
			props: { editingRelationship: constraint },
			width: CARD_WIDTHS.medium,
		});
	};

	const handleEditIndex = (index: IndexDefinition) => {
		stack.push({
			id: `edit-index-${index.id}`,
			title: 'Edit Index',
			Component: IndexCard,
			props: { editingIndex: index },
			width: CARD_WIDTHS.medium,
		});
	};

	const handleEditField = (field: FieldDefinition) => {
		stack.push({
			id: `edit-field-${field.id}`,
			title: 'Edit Field',
			Component: FieldCard,
			props: { tableId: table.id, tableName: table.name, editingField: field },
			width: CARD_WIDTHS.medium,
		});
	};

	return (
		<>
			{/* Header */}
			<div className='border-border flex items-center justify-between border-b px-4 py-3'>
				<div className='flex items-center gap-2'>
					<span className='text-muted-foreground/80 text-sm'>/</span>
					<span className='text-sm font-semibold'>{table.name}</span>
				</div>
				<Button variant='ghost' size='icon' className='size-7' onClick={onClose}>
					<RiCloseLine className='size-4' />
				</Button>
			</div>

			{/* Content */}
			<ScrollArea className='flex-1'>
				<div className='space-y-4 p-4'>
					{/* Fields section */}
					<section>
						<h3 className='text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide'>
							Fields ({table.fields.length})
						</h3>
						<div className='space-y-1'>
							{/* Primary keys first */}
							{primaryFields.map((field) => (
								<FieldRow key={field.id} field={field} isPrimary onEdit={() => handleEditField(field)} />
							))}
							{/* Foreign keys second */}
							{foreignFields.map((field) => (
								<FieldRow key={field.id} field={field} isForeign onEdit={() => handleEditField(field)} />
							))}
							{/* Regular fields last */}
							{regularFields.map((field) => (
								<FieldRow key={field.id} field={field} onEdit={() => handleEditField(field)} />
							))}
						</div>
					</section>

					<Separator />

					{/* Indexes section */}
					{table.indexes && table.indexes.length > 0 && (
						<section>
							<h3 className='text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide'>
								Indexes ({table.indexes.length})
							</h3>
							<div className='space-y-1'>
								{table.indexes.map((index) => (
									<IndexRow key={index.id} index={index} onEdit={() => handleEditIndex(index)} />
								))}
							</div>
						</section>
					)}

					{/* Constraints section (FK relationships shown here) */}
					{table.constraints && table.constraints.filter((c) => c.type === 'foreign_key').length > 0 && (
						<>
							<Separator />
							<section>
								<h3 className='text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide'>
									Relationships
								</h3>
								<div className='space-y-1'>
									{table.constraints
										.filter((c): c is ForeignKeyConstraint => c.type === 'foreign_key')
										.map((constraint) => (
											<FKConstraintRow
												key={constraint.id}
												constraint={constraint}
												onEdit={() => handleEditRelationship(constraint)}
											/>
										))}
								</div>
							</section>
						</>
					)}
				</div>
			</ScrollArea>
		</>
	);
}

// ============================================================================
// Field Row Component
// ============================================================================

interface FieldRowProps {
	field: FieldDefinition;
	isPrimary?: boolean;
	isForeign?: boolean;
	onEdit?: () => void;
}

function FieldRow({ field, isPrimary, isForeign, onEdit }: FieldRowProps) {
	const isNullable = field.constraints.nullable !== false;
	const isUnique = field.constraints.unique && !isPrimary;

	return (
		<div className='bg-muted/30 hover:bg-muted/50 group flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors'>
			{/* Constraint icons */}
			<div className='flex w-5 shrink-0 items-center justify-center'>
				{isPrimary && (
					<Tooltip>
						<TooltipTrigger>
							<RiKey2Line className='size-3.5 text-amber-500' />
						</TooltipTrigger>
						<TooltipContent side='left'>Primary Key</TooltipContent>
					</Tooltip>
				)}
				{isForeign && !isPrimary && (
					<Tooltip>
						<TooltipTrigger>
							<RiLinksLine className='text-primary size-3.5' />
						</TooltipTrigger>
						<TooltipContent side='left'>
							FK → {field.metadata?.targetTable}.{field.metadata?.targetField || 'id'}
						</TooltipContent>
					</Tooltip>
				)}
			</div>

			{/* Field name */}
			<span className='min-w-0 flex-1 truncate font-medium'>{field.name}</span>

			{/* Nullable indicator */}
			{!isNullable && <span className='text-rose-500/60 text-[10px]'>*</span>}
			{isUnique && <span className='text-violet-500/70 text-[10px]'>◇</span>}

			{/* Type */}
			<span className='text-muted-foreground/70 shrink-0'>{field.type}</span>

			{/* Edit button */}
			{onEdit && (
				<Button
					variant='ghost'
					size='icon'
					className='size-5 opacity-0 transition-opacity group-hover:opacity-100'
					onClick={onEdit}
				>
					<RiEditLine className='size-3' />
				</Button>
			)}
		</div>
	);
}

// ============================================================================
// Index Row Component
// ============================================================================

interface IndexRowProps {
	index: IndexDefinition;
	onEdit?: () => void;
}

function IndexRow({ index, onEdit }: IndexRowProps) {
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const deleteIndexMutation = useDeleteIndex();

	const handleDelete = async () => {
		try {
			await deleteIndexMutation.mutateAsync({ id: index.id });
			showSuccessToast({
				message: 'Index deleted',
				description: `Index "${index.name}" has been deleted.`,
			});
			setDeleteDialogOpen(false);
		} catch (error) {
			showErrorToast({
				message: 'Failed to delete index',
				description: error instanceof Error ? error.message : 'An unexpected error occurred.',
			});
		}
	};

	return (
		<div className='bg-muted/30 hover:bg-muted/50 group flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors'>
			<span className='min-w-0 flex-1 truncate font-medium'>{index.name}</span>
			{index.unique && (
				<Badge variant='secondary' className='h-4 px-1 text-[10px]'>
					unique
				</Badge>
			)}
			<span className='text-muted-foreground/60 shrink-0'>{index.type || 'btree'}</span>
			<div className='flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100'>
				{onEdit && (
					<Button variant='ghost' size='icon' className='size-5' onClick={onEdit}>
						<RiEditLine className='size-3' />
					</Button>
				)}
				<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
					<AlertDialogTrigger asChild>
						<Button variant='ghost' size='icon' className='size-5'>
							<RiDeleteBinLine className='text-destructive size-3' />
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Delete Index</AlertDialogTitle>
							<AlertDialogDescription>
								Are you sure you want to delete the index "{index.name}"? This action cannot be undone.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction
								onClick={handleDelete}
								className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
							>
								{deleteIndexMutation.isPending ? 'Deleting...' : 'Delete'}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		</div>
	);
}

// ============================================================================
// FK Constraint Row Component
// ============================================================================

interface FKConstraintRowProps {
	constraint: ForeignKeyConstraint;
	onEdit?: () => void;
}

function FKConstraintRow({ constraint, onEdit }: FKConstraintRowProps) {
	return (
		<div className='bg-muted/30 hover:bg-muted/50 group flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors'>
			<RiLinksLine className='text-primary size-3.5 shrink-0' />
			<span className='min-w-0 flex-1 truncate'>
				{constraint.fields.join(', ')} → {constraint.referencedTable}
			</span>
			{constraint.onDelete && (
				<span className='text-muted-foreground/60 shrink-0'>
					{ForeignKeyActionLabels[constraint.onDelete] || constraint.onDelete}
				</span>
			)}
			{onEdit && (
				<Button
					variant='ghost'
					size='icon'
					className='size-5 opacity-0 transition-opacity group-hover:opacity-100'
					onClick={onEdit}
				>
					<RiEditLine className='size-3' />
				</Button>
			)}
		</div>
	);
}

// ============================================================================
// Relationship Details Panel
// ============================================================================

interface RelationshipDetailsPanelProps {
	relationship: RelationshipDefinition;
	onClose: () => void;
}

function RelationshipDetailsPanel({ relationship, onClose }: RelationshipDetailsPanelProps) {
	const stack = useCardStack();
	const { getForeignKeyConstraint } = useVisualizerContext();
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const deleteForeignKeyMutation = useDeleteForeignKey();

	const fkConstraint = getForeignKeyConstraint(relationship);
	const canEdit = fkConstraint !== null;
	const canDelete = fkConstraint !== null;

	const handleEdit = () => {
		if (!fkConstraint) {
			showErrorToast({
				message: 'Cannot edit relationship',
				description: 'Could not find the foreign key constraint.',
			});
			return;
		}

		stack.push({
			id: `edit-relationship-${fkConstraint.id}`,
			title: 'Edit Relationship',
			Component: RelationshipCard,
			props: { editingRelationship: fkConstraint },
			width: CARD_WIDTHS.medium,
		});
	};

	const handleDelete = async () => {
		if (!fkConstraint) {
			showErrorToast({
				message: 'Cannot delete relationship',
				description: 'Could not find the foreign key constraint.',
			});
			return;
		}

		try {
			await deleteForeignKeyMutation.mutateAsync({ id: fkConstraint.id });
			showSuccessToast({
				message: 'Relationship deleted',
				description: 'The foreign key relationship has been removed.',
			});
			setDeleteDialogOpen(false);
			onClose();
		} catch (error) {
			showErrorToast({
				message: 'Failed to delete relationship',
				description: error instanceof Error ? error.message : 'An unexpected error occurred.',
			});
		}
	};

	return (
		<>
			{/* Header */}
			<div className='border-border flex items-center justify-between border-b px-4 py-3'>
				<div className='flex items-center gap-2'>
					<RiLinksLine className='text-primary size-4' />
					<span className='text-sm font-semibold'>Relationship</span>
				</div>
				<Button variant='ghost' size='icon' className='size-7' onClick={onClose}>
					<RiCloseLine className='size-4' />
				</Button>
			</div>

			{/* Content */}
			<div className='space-y-4 p-4'>
				{/* Visual diagram */}
				<div className='bg-muted/30 flex items-center justify-center gap-4 rounded-lg p-4'>
					<div className='text-center'>
						<div className='text-xs font-medium'>{relationship.sourceTable}</div>
						<div className='text-muted-foreground text-[10px]'>.{relationship.sourceField}</div>
					</div>
					<div className='text-muted-foreground flex items-center gap-1 text-xs'>
						<span>1</span>
						<span>─────</span>
						<span>∞</span>
					</div>
					<div className='text-center'>
						<div className='text-xs font-medium'>{relationship.targetTable}</div>
						<div className='text-muted-foreground text-[10px]'>.{relationship.targetField}</div>
					</div>
				</div>

				{/* Details */}
				<div className='space-y-2'>
					<DetailRow label='Type' value={RelationshipTypeLabels[relationship.type] || relationship.type} />
					{relationship.onDelete && (
						<DetailRow label='On Delete' value={ForeignKeyActionLabels[relationship.onDelete]} />
					)}
					{relationship.onUpdate && (
						<DetailRow label='On Update' value={ForeignKeyActionLabels[relationship.onUpdate]} />
					)}
				</div>

				{/* Actions */}
				<div className='flex gap-2 pt-2'>
					<Button variant='outline' size='sm' className='flex-1' onClick={handleEdit} disabled={!canEdit}>
						<RiEditLine className='mr-1.5 size-3.5' />
						Edit
					</Button>
					<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
						<AlertDialogTrigger asChild>
							<Button
								variant='outline'
								size='sm'
								className='text-destructive hover:bg-destructive/10'
								disabled={!canDelete}
							>
								<RiDeleteBinLine className='size-3.5' />
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Delete Relationship</AlertDialogTitle>
								<AlertDialogDescription>
									Are you sure you want to delete this foreign key relationship? This action cannot be undone.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction
									onClick={handleDelete}
									className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
								>
									{deleteForeignKeyMutation.isPending ? 'Deleting...' : 'Delete'}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			</div>
		</>
	);
}

function DetailRow({ label, value }: { label: string; value: string }) {
	return (
		<div className='flex items-center justify-between text-xs'>
			<span className='text-muted-foreground'>{label}</span>
			<span className='font-medium'>{value}</span>
		</div>
	);
}

// ============================================================================
// Create Table Panel (placeholder for now)
// ============================================================================

interface CreateTablePanelProps {
	onClose: () => void;
}

function CreateTablePanel({ onClose }: CreateTablePanelProps) {
	return (
		<>
			<div className='border-border flex items-center justify-between border-b px-4 py-3'>
				<span className='text-sm font-semibold'>Create Table</span>
				<Button variant='ghost' size='icon' className='size-7' onClick={onClose}>
					<RiCloseLine className='size-4' />
				</Button>
			</div>
			<div className='p-4 text-center'>
				<p className='text-muted-foreground text-sm'>Table creation form will go here.</p>
			</div>
		</>
	);
}

// ============================================================================
// Create Relationship Panel (placeholder for now)
// ============================================================================

interface CreateRelationshipPanelProps {
	onClose: () => void;
}

function CreateRelationshipPanel({ onClose }: CreateRelationshipPanelProps) {
	return (
		<>
			<div className='border-border flex items-center justify-between border-b px-4 py-3'>
				<span className='text-sm font-semibold'>Create Relationship</span>
				<Button variant='ghost' size='icon' className='size-7' onClick={onClose}>
					<RiCloseLine className='size-4' />
				</Button>
			</div>
			<div className='p-4 text-center'>
				<p className='text-muted-foreground text-sm'>Relationship creation form will go here.</p>
			</div>
		</>
	);
}
