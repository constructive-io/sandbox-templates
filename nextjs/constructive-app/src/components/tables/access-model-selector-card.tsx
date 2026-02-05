'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@constructive-io/ui/button';
import { Field } from '@constructive-io/ui/field';
import { Input } from '@constructive-io/ui/input';
import { ResponsiveDiagram } from '@constructive-io/ui/responsive-diagram';
import { ScrollArea } from '@constructive-io/ui/scroll-area';
import { useCardStack, type CardComponent, type CardId } from '@constructive-io/ui/stack';
import { showErrorToast, showSuccessToast } from '@constructive-io/ui/toast';
import { Check, Circle, Grid3X3 } from 'lucide-react';

import { useSchemaBuilderSelectors } from '@/lib/gql/hooks/schema-builder';
import { useCreateTable } from '@/lib/gql/hooks/schema-builder/use-create-table';
import { cn } from '@/lib/utils';

import type { AccessModelId } from './access-model-types';
import { PolicyDiagramByKey } from './policy-diagram';
import { usePolicyTypes } from './policy-hooks';
import { PolicyKnowMoreCard, type PolicyKnowMoreCardProps } from './policy-know-more-card';
import type { MergedPolicyType } from './policy-types';
import { TablePolicyConfigCard, type TablePolicyConfigCardProps } from './table-policy-config-card';

export interface AccessModelSelectorCardProps {
	onTableCreated?: (table: { id: string; name: string }) => void;
}

interface PolicyTypeCardProps {
	policyType: MergedPolicyType;
	isSelected: boolean;
	onSelect: () => void;
	onKnowMore: () => void;
}

function PolicyTypeCard({ policyType, isSelected, onSelect, onKnowMore }: PolicyTypeCardProps) {
	const Icon = policyType.icon;

	const handleKnowMoreClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		onKnowMore();
	};

	return (
		<button
			type='button'
			data-testid={`policy-card-${policyType.name}`}
			onClick={onSelect}
			className={cn(
				'relative flex w-full flex-col gap-3 rounded-lg border p-4 text-left transition-all',
				isSelected
					? 'border-primary bg-primary/5 ring-primary/20 ring-2'
					: 'border-border/60 hover:border-border hover:bg-muted/50',
			)}
		>
			{/* Diagram on top - fixed height for consistency */}
			<div className='flex h-28 items-center justify-center'>
				<ResponsiveDiagram className='h-full w-full [&>div]:border-0'>
					<PolicyDiagramByKey diagramKey={policyType.diagramKey ?? 'allow-all'} tableName='table' />
				</ResponsiveDiagram>
			</div>

			{/* Title and description */}
			<div className='flex items-start gap-3'>
				<Icon className={cn('h-5 w-5 shrink-0', isSelected ? 'text-primary' : 'text-muted-foreground')} />

				<div className='min-w-0 flex-1'>
					<p className={cn('text-sm font-semibold', isSelected && 'text-primary')}>{policyType.title}</p>
					<p className='text-muted-foreground mt-0.5 text-xs leading-relaxed'>{policyType.tagline}</p>
					<span
						role='button'
						tabIndex={0}
						data-testid={`policy-know-more-${policyType.name}`}
						onClick={handleKnowMoreClick}
						onKeyDown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								handleKnowMoreClick(e as unknown as React.MouseEvent);
							}
						}}
						className='text-primary hover:text-primary/80 mt-1 inline-flex cursor-pointer items-center gap-1 text-xs
							font-medium'
					>
						Know More →
					</span>
				</div>

				<div className='shrink-0'>
					{isSelected ? (
						<span className='bg-primary flex h-5 w-5 items-center justify-center rounded-full'>
							<Check className='h-3 w-3 text-white' />
						</span>
					) : (
						<Circle className='text-muted-foreground/40 h-5 w-5' />
					)}
				</div>
			</div>
		</button>
	);
}

function BlankTableCard({ isSelected, onSelect }: { isSelected: boolean; onSelect: () => void }) {
	return (
		<button
			type='button'
			onClick={onSelect}
			className={cn(
				'relative flex w-full items-center gap-3 rounded-lg border border-dashed px-4 py-3 text-left transition-all',
				isSelected ? 'border-primary bg-primary/5' : 'border-border/60 hover:border-border hover:bg-muted/30',
			)}
		>
			<Grid3X3 className={cn('h-5 w-5 shrink-0', isSelected ? 'text-primary' : 'text-muted-foreground/50')} />

			<div className='min-w-0 flex-1'>
				<p className={cn('text-sm font-semibold', isSelected && 'text-primary')}>Custom Table (Blank)</p>
				<p className='text-muted-foreground mt-0.5 text-xs'>No fields or RLS policies will be pre-created.</p>
			</div>

			<div className='shrink-0'>
				{isSelected ? (
					<span className='bg-primary flex h-5 w-5 items-center justify-center rounded-full'>
						<Check className='h-3 w-3 text-white' />
					</span>
				) : (
					<Circle className='text-muted-foreground/40 h-5 w-5' />
				)}
			</div>
		</button>
	);
}

export const AccessModelSelectorCard: CardComponent<AccessModelSelectorCardProps> = ({ onTableCreated, card }) => {
	const [tableName, setTableName] = useState('');
	const [tableNameTouched, setTableNameTouched] = useState(false);
	const [selectedModel, setSelectedModel] = useState<AccessModelId | null>(null);
	const [configCardId, setConfigCardId] = useState<CardId | null>(null);
	const [knowMoreCardId, setKnowMoreCardId] = useState<CardId | null>(null);

	const stack = useCardStack();

	const { currentDatabase, currentSchema } = useSchemaBuilderSelectors();
	const databaseId = currentDatabase?.databaseId ?? '';
	const schemaId = currentDatabase?.schemaId ?? '';

	const createTableMutation = useCreateTable();
	const { policyTypes, error: policyTypesError } = usePolicyTypes();

	const existingTableNames = useMemo(
		() => new Set((currentSchema?.tables || []).map((t) => t.name.toLowerCase())),
		[currentSchema?.tables],
	);

	const tableNameError = useMemo(() => {
		const trimmed = tableName.trim();
		if (!trimmed) return 'Table name is required';
		if (existingTableNames.has(trimmed.toLowerCase())) return 'Table name already exists';
		if (!/^[a-z_][a-z0-9_]*$/i.test(trimmed)) return 'Use letters, numbers, and underscores only';
		return null;
	}, [tableName, existingTableNames]);

	const isTableNameValid = tableNameError === null;
	const canProceed = isTableNameValid && selectedModel !== null;

	// Handle navigation to configuration step
	const handleNext = useCallback(() => {
		if (!selectedModel || selectedModel === 'blank') return;

		// Close Know More card if open
		if (knowMoreCardId && stack.has(knowMoreCardId)) {
			stack.dismiss(knowMoreCardId, { cascade: false });
			setKnowMoreCardId(null);
		}

		const pushedId = card.push({
			id: `create-table-config-${selectedModel}`,
			title: 'Configure Policy',
			Component: TablePolicyConfigCard,
			props: {
				tableName: tableName.trim(),
				selectedPolicyType: selectedModel,
				onTableCreated,
				onComplete: () => {
					// Reset form state and close both cards
					setTableName('');
					setTableNameTouched(false);
					setSelectedModel(null);
					setConfigCardId(null);
					card.close();
				},
			},
			onClose: () => {
				setConfigCardId(null);
			},
			width: 480,
		});

		setConfigCardId(pushedId);
	}, [selectedModel, knowMoreCardId, stack, card, tableName, onTableCreated]);

	useEffect(() => {
		if (!configCardId) return;
		if (!stack.has(configCardId)) {
			setConfigCardId(null);
			return;
		}

		if (!selectedModel || selectedModel === 'blank') {
			stack.dismiss(configCardId, { cascade: false });
			setConfigCardId(null);
			return;
		}

		stack.updateProps<TablePolicyConfigCardProps>(configCardId, {
			tableName: tableName.trim(),
			selectedPolicyType: selectedModel,
		});
	}, [configCardId, selectedModel, stack, tableName]);

	// Update Know More card when selection changes
	useEffect(() => {
		if (!knowMoreCardId) return;
		if (!stack.has(knowMoreCardId)) {
			setKnowMoreCardId(null);
			return;
		}

		// If blank is selected or no selection, close Know More
		if (!selectedModel || selectedModel === 'blank') {
			stack.dismiss(knowMoreCardId, { cascade: false });
			setKnowMoreCardId(null);
			return;
		}

		// Find the policy type for the current selection
		const selectedPolicyType = policyTypes.find((pt) => pt.name === selectedModel);
		if (selectedPolicyType) {
			stack.updateProps<PolicyKnowMoreCardProps>(knowMoreCardId, {
				policyType: selectedPolicyType,
				onApply: handleNext,
			});
		}
	}, [knowMoreCardId, selectedModel, stack, policyTypes, handleNext]);

	// Handle Know More card
	const handleKnowMore = (policyType: MergedPolicyType) => {
		// Select this policy type
		setSelectedModel(policyType.name as AccessModelId);

		// If config card is open, dismiss it first
		if (configCardId && stack.has(configCardId)) {
			stack.dismiss(configCardId, { cascade: false });
			setConfigCardId(null);
		}

		// If Know More card already open, just update it (handled by useEffect)
		if (knowMoreCardId && stack.has(knowMoreCardId)) {
			return;
		}

		// Push Know More card
		const pushedId = card.push({
			id: `know-more-${policyType.name}`,
			title: 'Policy Details',
			Component: PolicyKnowMoreCard,
			props: {
				policyType,
				onApply: handleNext, // handleNext will close Know More and open Config
			},
			onClose: () => {
				setKnowMoreCardId(null);
			},
			width: 420,
		});

		setKnowMoreCardId(pushedId);
	};

	// Handle blank table creation directly
	const handleCreateBlankTable = async () => {
		if (!isTableNameValid || !databaseId || !schemaId) return;

		try {
			const result = await createTableMutation.mutateAsync({
				name: tableName.trim(),
				databaseId,
				schemaId,
				useRls: true,
			});

			showSuccessToast({
				message: 'Table created successfully!',
				description: `Table "${result.name}" has been created with RLS enabled.`,
			});

			onTableCreated?.(result);
			// Reset form state before closing
			setTableName('');
			setTableNameTouched(false);
			setSelectedModel(null);
			card.close();
		} catch (error) {
			showErrorToast({
				message: 'Failed to create table',
				description: error instanceof Error ? error.message : 'An unexpected error occurred.',
			});
		}
	};

	const handleSubmit = () => {
		if (selectedModel === 'blank') {
			handleCreateBlankTable();
		} else {
			handleNext();
		}
	};

	const buttonText = selectedModel === 'blank' ? 'Create Table' : 'Next';
	const isButtonDisabled = !canProceed || createTableMutation.isPending;

	return (
		<div className='flex h-full flex-col'>
			<ScrollArea className='min-h-0 flex-1'>
				<div className='space-y-6 p-6'>
					{/* Table Name Input - First Field */}
					<Field
						label='Table Name'
						required
						htmlFor='table-name'
						error={tableNameTouched && !configCardId ? (tableNameError ?? undefined) : undefined}
					>
						<Input
							id='table-name'
							data-testid='table-name-input'
							value={tableName}
							onChange={(e) => setTableName(e.target.value)}
							onBlur={() => setTableNameTouched(true)}
							placeholder='e.g., posts, comments, orders'
							autoComplete='off'
							autoFocus
							className={cn('font-mono', tableNameTouched && tableNameError && !configCardId && 'border-destructive')}
						/>
					</Field>

					{/* Access Model Selection */}
					<div className='space-y-3'>
						<p className='text-muted-foreground text-xs font-semibold tracking-wide uppercase'>Select Access Model</p>

						{/* Show error only if no fallback data available */}
						{policyTypesError && policyTypes.length === 0 && (
							<div className='rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30'>
								<p className='text-sm text-red-600 dark:text-red-400'>Failed to load policy types</p>
							</div>
						)}

						{/* Always show policy types (fallback data provides immediate availability) */}
						<div className='grid gap-3 sm:grid-cols-2'>
							{policyTypes.map((policyType) => (
								<PolicyTypeCard
									key={policyType.name}
									policyType={policyType}
									isSelected={selectedModel === policyType.name}
									onSelect={() => setSelectedModel(policyType.name as AccessModelId)}
									onKnowMore={() => handleKnowMore(policyType)}
								/>
							))}
						</div>

						<BlankTableCard isSelected={selectedModel === 'blank'} onSelect={() => setSelectedModel('blank')} />
					</div>
				</div>
			</ScrollArea>

			<div className='flex justify-end gap-2 border-t p-4'>
				<Button variant='outline' onClick={() => card.close()} disabled={createTableMutation.isPending}>
					Cancel
				</Button>
				<Button onClick={handleSubmit} disabled={isButtonDisabled}>
					{createTableMutation.isPending && <span className='mr-2 h-4 w-4 animate-spin' />}
					{createTableMutation.isPending ? 'Creating...' : buttonText}
				</Button>
			</div>
		</div>
	);
};
