'use client';

import { useMemo, useState } from 'react';
import { Button } from '@constructive-io/ui/button';
import { useCardStack } from '@constructive-io/ui/stack';
import { toast } from '@constructive-io/ui/toast';
import { ArrowRight, Link2, Loader2, Table2, Trash2 } from 'lucide-react';

import { useSchemaBuilderSelectors } from '@/lib/gql/hooks/schema-builder';
import { useDeleteForeignKey } from '@/lib/gql/hooks/schema-builder/use-relationship-mutations';
import type { ForeignKeyConstraint, RelationshipType, TableDefinition } from '@/lib/schema';
import { cn } from '@/lib/utils';

import { RelationshipCard } from './relationship-card';
import { RelationshipEmptyState } from './relationship-empty-state';

interface TableRelationship {
	constraint: ForeignKeyConstraint;
	targetTable: TableDefinition | undefined;
	sourceFieldName: string;
	targetFieldName: string;
	relationshipType: RelationshipType;
}

const RELATIONSHIP_STYLES: Record<
	RelationshipType,
	{
		stroke: string;
		bg: string;
		border: string;
		text: string;
		label: string;
		shortLabel: string;
	}
> = {
	'one-to-one': {
		stroke: '#a855f7',
		bg: 'bg-purple-500/10',
		border: 'border-purple-500/30',
		text: 'text-purple-400',
		label: 'One to One',
		shortLabel: '1:1',
	},
	'one-to-many': {
		stroke: '#60a5fa',
		bg: 'bg-blue-500/10',
		border: 'border-blue-500/30',
		text: 'text-blue-400',
		label: 'One to Many',
		shortLabel: '1:N',
	},
	'many-to-many': {
		stroke: '#fbbf24',
		bg: 'bg-amber-500/10',
		border: 'border-amber-500/30',
		text: 'text-amber-400',
		label: 'Many to Many',
		shortLabel: 'N:M',
	},
};

const FK_ACTION_LABELS: Record<string, string> = {
	c: 'Cascade',
	r: 'Restrict',
	n: 'Set Null',
	d: 'Set Default',
	a: 'No Action',
};

// Mini connector icons for list view
function MiniConnector({ type, color }: { type: RelationshipType; color: string }) {
	if (type === 'one-to-one') {
		return (
			<svg width='32' height='16' viewBox='0 0 32 16' fill='none' className='shrink-0'>
				<circle cx='4' cy='8' r='3' fill={color} fillOpacity='0.3' stroke={color} strokeWidth='1.5' />
				<line x1='8' y1='8' x2='24' y2='8' stroke={color} strokeWidth='1.5' strokeDasharray='2 2' />
				<circle cx='28' cy='8' r='3' fill={color} fillOpacity='0.3' stroke={color} strokeWidth='1.5' />
			</svg>
		);
	}
	if (type === 'one-to-many') {
		return (
			<svg width='32' height='16' viewBox='0 0 32 16' fill='none' className='shrink-0'>
				<circle cx='4' cy='8' r='3' fill={color} fillOpacity='0.3' stroke={color} strokeWidth='1.5' />
				<line x1='8' y1='8' x2='20' y2='8' stroke={color} strokeWidth='1.5' />
				<path d='M18 5L22 8L18 11' stroke={color} strokeWidth='1.5' fill='none' strokeLinecap='round' />
				<circle cx='26' cy='3' r='2' fill={color} />
				<circle cx='28' cy='8' r='2' fill={color} />
				<circle cx='26' cy='13' r='2' fill={color} />
			</svg>
		);
	}
	// many-to-many
	return (
		<svg width='32' height='16' viewBox='0 0 32 16' fill='none' className='shrink-0'>
			<circle cx='4' cy='3' r='2' fill={color} />
			<circle cx='2' cy='8' r='2' fill={color} />
			<circle cx='4' cy='13' r='2' fill={color} />
			<path d='M8 8 Q16 2 24 8' stroke={color} strokeWidth='1.5' fill='none' />
			<path d='M8 8 Q16 14 24 8' stroke={color} strokeWidth='1.5' fill='none' />
			<circle cx='28' cy='3' r='2' fill={color} />
			<circle cx='30' cy='8' r='2' fill={color} />
			<circle cx='28' cy='13' r='2' fill={color} />
		</svg>
	);
}

function NoTableSelectedState() {
	return (
		<div className='flex min-h-0 flex-1 flex-col items-center justify-center p-6'>
			<div className='bg-muted/50 mb-4 flex h-16 w-16 items-center justify-center rounded-full'>
				<Table2 className='text-muted-foreground h-8 w-8' />
			</div>
			<h3 className='mb-1 text-lg font-semibold'>No table selected</h3>
			<p className='text-muted-foreground max-w-sm text-center text-sm'>
				Select a table from the sidebar to view and manage its relationships.
			</p>
		</div>
	);
}

export function RelationshipsView() {
	const [deletingId, setDeletingId] = useState<string | null>(null);

	const stack = useCardStack();
	const { currentTable, currentSchema } = useSchemaBuilderSelectors();
	const deleteForeignKeyMutation = useDeleteForeignKey();

	const tables = currentSchema?.tables || [];

	// Get relationships for the CURRENT table only
	const tableRelationships = useMemo<TableRelationship[]>(() => {
		if (!currentTable) return [];

		const fkConstraints = (currentTable.constraints || []).filter(
			(c): c is ForeignKeyConstraint => c.type === 'foreign_key',
		);

		return fkConstraints.map((fk) => {
			const targetTable = tables.find((t) => t.id === fk.referencedTable);
			const sourceField = currentTable.fields.find((f) => f.id === fk.fields[0]);
			const targetField = targetTable?.fields.find((f) => f.id === fk.referencedFields?.[0]);

			// Read relationship type from smartTags
			const relationshipType: RelationshipType = (fk.smartTags?.relationshipType as RelationshipType) || 'one-to-many';

			return {
				constraint: fk,
				targetTable,
				sourceFieldName: sourceField?.name || fk.fields[0] || '',
				targetFieldName: targetField?.name || fk.referencedFields?.[0] || '',
				relationshipType,
			};
		});
	}, [currentTable, tables]);

	const handleOpenCreate = () => {
		if (!currentTable) return;
		stack.push({
			id: 'relationship-new',
			title: 'Create Relationship',
			Component: RelationshipCard,
			props: {
				editingRelationship: null,
				sourceTable: currentTable,
			},
			width: 800,
		});
	};

	const handleOpenEdit = (rel: TableRelationship) => {
		if (!currentTable) return;
		stack.push({
			id: `relationship-edit-${rel.constraint.id}`,
			title: 'Edit Relationship',
			Component: RelationshipCard,
			props: {
				editingRelationship: rel.constraint,
				sourceTable: currentTable,
			},
			width: 800,
		});
	};

	const handleDelete = async (constraintId: string) => {
		setDeletingId(constraintId);
		try {
			await deleteForeignKeyMutation.mutateAsync({ id: constraintId });
			toast.success({
				message: 'Relationship deleted',
				description: 'The relationship has been successfully deleted',
			});
		} catch (error) {
			toast.error({
				message: 'Failed to delete relationship',
				description: error instanceof Error ? error.message : 'An error occurred',
			});
		} finally {
			setDeletingId(null);
		}
	};

	// No table selected state
	if (!currentTable) {
		return <NoTableSelectedState />;
	}

	const hasRelationships = tableRelationships.length > 0;

	return (
		<div className='flex min-h-0 flex-1 flex-col overflow-auto p-6'>
			{!hasRelationships ? (
				<RelationshipEmptyState onCreateClick={handleOpenCreate} tableName={currentTable.name} />
			) : (
				<div className='mx-auto w-full max-w-4xl space-y-6'>
					{/* Header */}
					<div className='flex items-center justify-between'>
						<div>
							<h2 className='text-xl font-semibold tracking-tight'>Relationships</h2>
							<p className='text-muted-foreground mt-1 text-sm'>
								{tableRelationships.length} connection{tableRelationships.length !== 1 ? 's' : ''} from{' '}
								<code className='bg-muted rounded px-1.5 py-0.5 font-mono text-xs'>{currentTable.name}</code>
							</p>
						</div>
						<Button onClick={handleOpenCreate}>
							<Link2 className='mr-2 h-4 w-4' />
							Add Relationship
						</Button>
					</div>

					{/* Relationship Cards */}
					<div className='space-y-3'>
						{tableRelationships.map((rel) => {
							const isDeleting = deletingId === rel.constraint.id;
							const style = RELATIONSHIP_STYLES[rel.relationshipType];

							return (
								<div
									key={rel.constraint.id}
									onClick={() => !isDeleting && handleOpenEdit(rel)}
									className={cn(
										'group relative cursor-pointer rounded-xl border p-4 transition-all duration-200',
										'border-border/60 hover:border-border/80 hover:bg-muted/30',
										isDeleting && 'pointer-events-none opacity-50',
									)}
								>
										{/* Header: Name + Type Pill + Delete */}
									<div className='flex items-center justify-between'>
										<div className='flex items-center gap-2'>
											<Link2 className='text-muted-foreground h-4 w-4' />
											<p className='truncate text-sm font-semibold'>{rel.constraint.name}</p>
											<span
												className={cn(
													'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
													style.bg,
													style.text,
													'border',
													style.border,
												)}
											>
												{style.label}
											</span>
										</div>
										<Button
											variant='ghost'
											size='sm'
											className='text-muted-foreground hover:text-destructive hover:bg-destructive/10 mr-2 h-8 w-8
												shrink-0 p-0'
											onClick={(e) => {
												e.stopPropagation();
												handleDelete(rel.constraint.id);
											}}
											disabled={isDeleting}
										>
											{isDeleting ? <Loader2 className='h-4 w-4 animate-spin' /> : <Trash2 className='h-4 w-4' />}
										</Button>
									</div>

									{/* Source → Target */}
									<div className='mt-3 flex items-center gap-3'>
										<div className='bg-background truncate rounded-md border px-3 py-1.5 font-mono text-sm'>
											<span className='text-foreground'>{currentTable.name}</span>
											<span className='text-muted-foreground'>.</span>
											<span className={style.text}>{rel.sourceFieldName}</span>
										</div>

										<MiniConnector type={rel.relationshipType} color={style.stroke} />

										<div className='bg-background truncate rounded-md border px-3 py-1.5 font-mono text-sm'>
											<span className='text-foreground'>{rel.targetTable?.name || '?'}</span>
											<span className='text-muted-foreground'>.</span>
											<span className={style.text}>{rel.targetFieldName}</span>
										</div>
									</div>

									{/* Footer: FK Actions */}
									<div className='mt-3 flex items-center gap-4 border-t pt-3'>
										<div className='text-muted-foreground flex items-center gap-1.5 text-xs'>
											<ArrowRight className='h-3 w-3' />
											<span>Update:</span>
											<span className='text-foreground/70 font-medium'>
												{FK_ACTION_LABELS[rel.constraint.onUpdate || 'a']}
											</span>
										</div>
										<div className='bg-border h-3 w-px' />
										<div className='text-muted-foreground flex items-center gap-1.5 text-xs'>
											<Trash2 className='h-3 w-3' />
											<span>Delete:</span>
											<span className='text-foreground/70 font-medium'>
												{FK_ACTION_LABELS[rel.constraint.onDelete || 'a']}
											</span>
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
