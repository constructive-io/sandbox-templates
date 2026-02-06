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
	/** Mode: 'create-table' creates new table with policies, 'add-policies' adds policies to existing table */
	mode?: 'create-table' | 'add-policies';
	/** Required when mode='add-policies': the existing table ID */
	tableId?: string;
	/** Used as table name when mode='add-policies', or as initial value when mode='create-table' */
	tableName?: string;
	onTableCreated?: (table: { id: string; name: string }) => void;
	/** Called when policies are created for an existing table (when mode='add-policies') */
	onPoliciesCreated?: () => void;
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
				'relative flex w-full flex-col gap-3 rounded-lg border p-4 text-left transition-all',
				isSelected
					? 'border-primary bg-primary/5 ring-primary/20 ring-2'
					: 'border-border/60 border-dashed hover:border-border hover:bg-muted/30',
			)}
		>
			{/* Simple diagram area with icon */}
			<div
				className={cn(
					'flex h-28 items-center justify-center rounded-lg border border-dashed',
					isSelected ? 'border-primary/30 bg-primary/5' : 'border-border/40 bg-muted/20',
				)}
			>
				<div
					className={cn(
						'flex h-14 w-14 items-center justify-center rounded-xl border-2 border-dashed',
						isSelected ? 'border-primary/40 bg-primary/10' : 'border-muted-foreground/20 bg-muted/30',
					)}
				>
					<Grid3X3 className={cn('h-7 w-7', isSelected ? 'text-primary/60' : 'text-muted-foreground/40')} />
				</div>
			</div>

			{/* Title and description */}
			<div className='flex items-start gap-3'>
				<Grid3X3 className={cn('h-5 w-5 shrink-0', isSelected ? 'text-primary' : 'text-muted-foreground')} />

				<div className='min-w-0 flex-1'>
					<p className={cn('text-sm font-semibold', isSelected && 'text-primary')}>Custom Table (Blank)</p>
					<p className='text-muted-foreground mt-0.5 text-xs leading-relaxed'>
						No fields or RLS policies will be pre-created.
					</p>
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

export const AccessModelSelectorCard: CardComponent<AccessModelSelectorCardProps> = ({
	mode = 'create-table',
	tableId,
	tableName: propTableName,
	onTableCreated,
	onPoliciesCreated,
	card,
}) => {
	const isAddPoliciesMode = mode === 'add-policies';

	const [tableNameInput, setTableNameInput] = useState(propTableName ?? '');
	const [tableNameTouched, setTableNameTouched] = useState(false);
	const [selectedModel, setSelectedModel] = useState<AccessModelId | null>(null);
	const [configCardId, setConfigCardId] = useState<CardId | null>(null);
	const [knowMoreCardId, setKnowMoreCardId] = useState<CardId | null>(null);

	// In add-policies mode, use the prop tableName; otherwise use state
	const effectiveTableName = isAddPoliciesMode ? (propTableName ?? '') : tableNameInput;

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
		// In add-policies mode, table name is already valid (comes from existing table)
		if (isAddPoliciesMode) return null;

		const trimmed = tableNameInput.trim();
		if (!trimmed) return 'Table name is required';
		if (existingTableNames.has(trimmed.toLowerCase())) return 'Table name already exists';
		if (!/^[a-z_][a-z0-9_]*$/i.test(trimmed)) return 'Use letters, numbers, and underscores only';
		return null;
	}, [tableNameInput, existingTableNames, isAddPoliciesMode]);

	const isTableNameValid = tableNameError === null;
	// In add-policies mode, can proceed if a non-blank model is selected
	// In create-table mode, need valid table name and a selected model
	const canProceed = isAddPoliciesMode
		? selectedModel !== null && selectedModel !== 'blank'
		: isTableNameValid && selectedModel !== null;

	// Handle navigation to configuration step
	const handleNext = useCallback(() => {
		if (!selectedModel || selectedModel === 'blank') return;

		// Close Know More card if open
		if (knowMoreCardId && stack.has(knowMoreCardId)) {
			stack.dismiss(knowMoreCardId, { cascade: false });
			setKnowMoreCardId(null);
		}

		const pushedId = card.push({
			id: isAddPoliciesMode ? `add-policies-config-${selectedModel}` : `create-table-config-${selectedModel}`,
			title: 'Configure Policy',
			Component: TablePolicyConfigCard,
			props: {
				tableId: isAddPoliciesMode ? tableId : undefined,
				tableName: effectiveTableName.trim(),
				selectedPolicyType: selectedModel,
				onTableCreated,
				onPoliciesCreated,
				onComplete: () => {
					// Reset form state and close both cards
					setTableNameInput('');
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
	}, [selectedModel, knowMoreCardId, stack, card, effectiveTableName, onTableCreated, onPoliciesCreated, isAddPoliciesMode, tableId]);

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
			tableId: isAddPoliciesMode ? tableId : undefined,
			tableName: effectiveTableName.trim(),
			selectedPolicyType: selectedModel,
		});
	}, [configCardId, selectedModel, stack, effectiveTableName, isAddPoliciesMode, tableId]);

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

	// Handle blank table creation directly (only in create-table mode)
	const handleCreateBlankTable = async () => {
		if (!isTableNameValid || !databaseId || !schemaId || isAddPoliciesMode) return;

		try {
			const result = await createTableMutation.mutateAsync({
				name: tableNameInput.trim(),
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
			setTableNameInput('');
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
		if (selectedModel === 'blank' && !isAddPoliciesMode) {
			handleCreateBlankTable();
		} else {
			handleNext();
		}
	};

	const buttonText = selectedModel === 'blank' && !isAddPoliciesMode ? 'Create Table' : 'Next';
	const isButtonDisabled = !canProceed || createTableMutation.isPending;

	return (
		<div className='flex h-full flex-col'>
			<ScrollArea className='min-h-0 flex-1'>
				<div className='space-y-6 p-6'>
					{/* Table Name Input - Only show in create-table mode */}
					{!isAddPoliciesMode && (
						<Field
							label='Table Name'
							required
							htmlFor='table-name'
							error={tableNameTouched && !configCardId ? (tableNameError ?? undefined) : undefined}
						>
							<Input
								id='table-name'
								data-testid='table-name-input'
								value={tableNameInput}
								onChange={(e) => setTableNameInput(e.target.value)}
								onBlur={() => setTableNameTouched(true)}
								placeholder='e.g., posts, comments, orders'
								autoComplete='off'
								autoFocus
								className={cn('font-mono', tableNameTouched && tableNameError && !configCardId && 'border-destructive')}
							/>
						</Field>
					)}

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
							{/* Blank table option - only in create-table mode */}
							{!isAddPoliciesMode && (
								<BlankTableCard isSelected={selectedModel === 'blank'} onSelect={() => setSelectedModel('blank')} />
							)}
						</div>
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
