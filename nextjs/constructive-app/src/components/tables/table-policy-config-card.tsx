'use client';

import { useEffect, useState } from 'react';
import { Button } from '@constructive-io/ui/button';
import { Label } from '@constructive-io/ui/label';
import { ResponsiveDiagram } from '@constructive-io/ui/responsive-diagram';
import { ScrollArea } from '@constructive-io/ui/scroll-area';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectRichItem,
	SelectTrigger,
	SelectValue,
} from '@constructive-io/ui/select';
import { useCardStack, type CardComponent, type CardId } from '@constructive-io/ui/stack';
import { showErrorToast, showSuccessToast } from '@constructive-io/ui/toast';
import { Loader2Icon } from 'lucide-react';

import { useSchemaBuilderSelectors } from '@/lib/gql/hooks/schema-builder';
import { POLICY_ROLES } from '@/components/policies/policies.types';
import { mapConditionNodeToAst } from '@/lib/policies/ast-helpers';

import {
	CompositePolicyBuilder,
	createEmptyCompositePolicyData,
	type CompositePolicyData,
} from './composite-policy-builder';
import { OperationEditCard, type OperationEditCardProps } from './operation-edit-card';
import { OperationPolicyRow } from './operation-policy-row';
import { buildTableModuleData, getFieldsRequiringColumns, injectSchemaFields } from './policy-config';
import { PolicyConfigForm } from './policy-config-form';
import { PolicyDiagramByKey } from './policy-diagram';
import { getDefaultFormValues, useCreateTableWithPolicies, usePolicyType, usePolicyTypes } from './policy-hooks';
import { CRUD_OPERATIONS, type CrudOperation } from './policy-types';
import { useCrudPolicyState } from './use-crud-policy-state';

export interface TablePolicyConfigCardProps {
	/** If provided, skip table creation and create policies for this existing table */
	tableId?: string;
	tableName: string;
	selectedPolicyType: string;
	onTableCreated?: (table: { id: string; name: string }) => void;
	/** Called when policies are created for an existing table (when tableId is provided) */
	onPoliciesCreated?: () => void;
	onComplete?: () => void;
}

/**
 * Config card for table policy settings with 4 CRUD operations.
 * Shows default settings (including access rule), 4 operation rows.
 * Each operation can be customized via side card.
 */
export const TablePolicyConfigCard: CardComponent<TablePolicyConfigCardProps> = ({
	tableId,
	tableName,
	selectedPolicyType,
	onTableCreated,
	onPoliciesCreated,
	onComplete,
	card,
}) => {
	const isAddingToExistingTable = Boolean(tableId);
	const stack = useCardStack();
	const { policyType, isLoading: isPolicyTypeLoading } = usePolicyType(selectedPolicyType);
	const { policyTypes } = usePolicyTypes();
	const { createTableWithPolicies, isCreating } = useCreateTableWithPolicies();
	const isCompositePolicy = selectedPolicyType === 'AuthzComposite';

	const { currentDatabase } = useSchemaBuilderSelectors();
	const databaseId = currentDatabase?.databaseId ?? '';
	const schemaId = currentDatabase?.schemaId ?? '';

	// CRUD policy state management (including policyData in defaults)
	const {
		defaults,
		operations,
		enabledOperations,
		updateDefaults,
		updateOperation,
		resetOperationToDefaults,
		toggleOperationEnabled,
		getEnabledOperations,
	} = useCrudPolicyState();

	// Track if defaults have been initialized with policyType defaults
	const [defaultsInitialized, setDefaultsInitialized] = useState(false);

	// Track which operation edit card is open
	const [editCardId, setEditCardId] = useState<CardId | null>(null);

	// Initialize defaults.policyData with default values when policyType loads
	useEffect(() => {
		if (policyType && !defaultsInitialized) {
			// For composite policies, initialize with tree structure containing one default condition
			const defaultPolicyData = isCompositePolicy
				? createEmptyCompositePolicyData('AuthzDirectOwner', getDefaultFormValues(policyTypes[0] ?? policyType))
				: getDefaultFormValues(policyType);
			updateDefaults({ policyData: defaultPolicyData });
			setDefaultsInitialized(true);
		}
	}, [policyType, policyTypes, defaultsInitialized, updateDefaults, isCompositePolicy]);

	// Track which operation is being edited (separate state for clean updates)
	const [editingOp, setEditingOp] = useState<CrudOperation | null>(null);

	// Handle opening edit side card for an operation
	const handleEditOperation = (op: CrudOperation) => {
		if (!policyType) return;

		if (editCardId && stack.has(editCardId)) {
			// Card already open - just update its props (avoids dismiss+push timing issues)
			stack.updateProps<OperationEditCardProps>(editCardId, {
				operation: op,
				config: operations[op],
				policyType,
				onSave: (updates) => updateOperation(op, updates),
				onResetToDefaults: () => resetOperationToDefaults(op),
			});
			setEditingOp(op);
		} else {
			// No card open - push new one
			const pushedId = stack.push({
				id: 'edit-operation',
				title: 'Operation Settings',
				Component: OperationEditCard,
				props: {
					operation: op,
					config: operations[op],
					policyType,
					onSave: (updates) => updateOperation(op, updates),
					onResetToDefaults: () => resetOperationToDefaults(op),
				} satisfies OperationEditCardProps,
				onClose: () => {
					setEditCardId(null);
					setEditingOp(null);
				},
				width: 420,
			});
			setEditCardId(pushedId);
			setEditingOp(op);
		}
	};

	// Get config for the operation being edited
	const editingConfig = editingOp ? operations[editingOp] : null;

	// Serialize config for reliable dependency (object refs may not trigger effect)
	const editingConfigKey = editingConfig
		? `${editingConfig.roleName}:${editingConfig.isPermissive}:${JSON.stringify(editingConfig.policyData)}`
		: null;

	// Update edit card props when operation config changes
	useEffect(() => {
		if (!editCardId || !editingOp || !editingConfig || !stack.has(editCardId) || !policyType) return;

		stack.updateProps<OperationEditCardProps>(editCardId, {
			operation: editingOp,
			config: editingConfig,
			policyType,
			onSave: (updates) => updateOperation(editingOp, updates),
			onResetToDefaults: () => resetOperationToDefaults(editingOp),
		});
	}, [
		editCardId,
		editingOp,
		editingConfig,
		editingConfigKey,
		policyType,
		stack,
		updateOperation,
		resetOperationToDefaults,
	]);

	// Validate composite policy has conditions (tree structure uses 'children')
	const compositeData = defaults.policyData as CompositePolicyData;
	const hasValidCompositeConditions = !isCompositePolicy || (compositeData?.children?.length ?? 0) > 0;

	const handleSubmit = async () => {
		const enabledOps = getEnabledOperations();
		if (!policyType || !databaseId || !schemaId || enabledOps.length === 0) return;

		// Validate composite policy has at least one condition
		if (isCompositePolicy && !hasValidCompositeConditions) return;

		// Prepare operations with injected schema fields in policyData (only enabled ones)
		const preparedOperations = { ...operations };
		for (const op of enabledOps) {
			preparedOperations[op] = {
				...operations[op],
				policyData: injectSchemaFields(operations[op].policyData, schemaId, policyType.name),
			};
		}

		// Build table module data from defaults policyData (field name customizations)
		const tableModuleData = buildTableModuleData(defaults.policyData, policyType);

		// Extract field name overrides for 'needs-fields' category policies
		const fieldNameOverrides: Record<string, string> = {};
		if (policyType.category === 'needs-fields') {
			const fieldsToCreate = getFieldsRequiringColumns(policyType.name);
			for (const field of fieldsToCreate) {
				const customName = defaults.policyData[field.key];
				if (typeof customName === 'string' && customName.trim()) {
					fieldNameOverrides[field.key] = customName;
				}
			}
		}

		// For composite policies, convert tree structure to AST format
		const sharedPolicyData = isCompositePolicy
			? mapConditionNodeToAst(compositeData) ?? {}
			: injectSchemaFields(defaults.policyData, schemaId, policyType.name);

		try {
			const result = await createTableWithPolicies({
				databaseId,
				schemaId,
				tableId,
				tableName,
				policyType: policyType.name,
				tableModuleType: policyType.tableModuleType,
				tableModuleData,
				sharedPolicyData,
				operations: preparedOperations,
				enabledOperations: enabledOps,
				fieldNameOverrides,
			});

			if (isAddingToExistingTable) {
				showSuccessToast({
					message: 'Policies created successfully!',
					description: `${result.policyIds.length} policies have been added to "${tableName}".`,
				});
				onPoliciesCreated?.();
			} else {
				showSuccessToast({
					message: 'Table created successfully!',
					description: `Table "${result.tableName}" with ${result.policyIds.length} policies has been created.`,
				});
				onTableCreated?.({ id: result.tableId, name: result.tableName });
			}

			onComplete?.();
			card.close();
		} catch (error) {
			showErrorToast({
				message: isAddingToExistingTable ? 'Failed to create policies' : 'Failed to create table',
				description: error instanceof Error ? error.message : 'An unexpected error occurred.',
			});
		}
	};

	const handleFormSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!isCreating) {
			handleSubmit();
		}
	};

	if (isPolicyTypeLoading) {
		return (
			<div className='flex h-full items-center justify-center'>
				<Loader2Icon className='text-muted-foreground h-6 w-6 animate-spin' />
			</div>
		);
	}

	if (!policyType) {
		return (
			<div className='flex h-full items-center justify-center p-6'>
				<p className='text-muted-foreground text-sm'>Policy type not found</p>
			</div>
		);
	}

	const PolicyIcon = policyType.icon;

	return (
		<form onSubmit={handleFormSubmit} className='flex h-full flex-col'>
			<ScrollArea className='min-h-0 flex-1'>
				<div className='space-y-6 p-6'>
					<div className='space-y-4'>
						{/* Policy Header */}
						<div className='flex items-center gap-3'>
							<div className='bg-primary/10 flex size-10 shrink-0 items-center justify-center rounded-lg'>
								<PolicyIcon className='text-primary size-5' />
							</div>
							<div className='min-w-0 flex-1'>
								<h3 className='font-semibold'>{policyType.title}</h3>
								<p className='text-muted-foreground text-sm'>{policyType.tagline}</p>
								{policyType.description && (
									<p className='text-muted-foreground text-sm italic'>{policyType.description}</p>
								)}
							</div>
						</div>

						{/* Policy Diagram */}
						<ResponsiveDiagram>
							<PolicyDiagramByKey
								diagramKey={policyType.diagramKey ?? 'allow-all'}
								tableName={tableName}
								config={defaults.policyData}
							/>
						</ResponsiveDiagram>
					</div>

					{/* Basic Settings */}
					<div className='space-y-3'>
						<p className='text-muted-foreground text-xs font-semibold tracking-wide uppercase'>Basic Settings</p>
						<div className='grid gap-3 sm:grid-cols-2'>
							<div className='space-y-1.5'>
								<Label htmlFor='default-role'>Role</Label>
								<Select
									value={defaults.roleName}
									onValueChange={(v) => updateDefaults({ roleName: v })}
									disabled={isCreating}
								>
									<SelectTrigger id='default-role'>
										<SelectValue placeholder='Select role' />
									</SelectTrigger>
									<SelectContent>
										{POLICY_ROLES.map((r) => (
											<SelectItem key={r.value} value={r.value}>
												{r.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className='space-y-1.5'>
								<Label htmlFor='default-mode'>Mode</Label>
								<Select
									value={defaults.isPermissive ? 'permissive' : 'restrictive'}
									onValueChange={(v) => updateDefaults({ isPermissive: v === 'permissive' })}
									disabled={isCreating}
								>
									<SelectTrigger id='default-mode'>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectRichItem value='permissive' label='Permissive' description='Allows access when matched' />
										<SelectRichItem value='restrictive' label='Restrictive' description='Must pass for access' />
									</SelectContent>
								</Select>
							</div>
						</div>
					</div>

					{/* Access Rule Config */}
					<div className='space-y-3'>
						<p className='text-muted-foreground text-xs font-semibold tracking-wide uppercase'>Access Rule Config</p>
						{isCompositePolicy ? (
							<CompositePolicyBuilder
								value={defaults.policyData as CompositePolicyData}
								onChange={(policyData) => updateDefaults({ policyData })}
								policyTypes={policyTypes}
								disabled={isCreating}
							/>
						) : (
							<PolicyConfigForm
								policyType={policyType}
								value={defaults.policyData}
								onChange={(policyData) => updateDefaults({ policyData })}
								disabled={isCreating}
							/>
						)}
					</div>

					{/* Operations */}
					<div className='space-y-3'>
						<p className='text-muted-foreground text-xs font-semibold tracking-wide uppercase'>Operations</p>
						<p className='text-muted-foreground text-xs'>
							We've applied the <span className='font-medium'>{policyType.title}</span> to all operations.
							<br />
							You can customize per action if needed.
						</p>
						<div className='space-y-2'>
							{CRUD_OPERATIONS.map((op) => (
								<OperationPolicyRow
									key={op}
									operation={op}
									config={operations[op]}
									policyTypeName={policyType.title}
									onEdit={() => handleEditOperation(op)}
									disabled={isCreating}
									enabled={enabledOperations[op]}
									onToggleEnabled={() => toggleOperationEnabled(op)}
								/>
							))}
						</div>
					</div>
				</div>
			</ScrollArea>

			<div className='flex justify-end gap-2 border-t px-4 py-3'>
				<Button type='button' variant='outline' onClick={() => card.close()} disabled={isCreating}>
					Back
				</Button>
				<Button type='submit' disabled={isCreating || getEnabledOperations().length === 0 || !hasValidCompositeConditions}>
					{isCreating && <Loader2Icon className='mr-2 h-4 w-4 animate-spin' />}
					{isCreating ? 'Creating...' : isAddingToExistingTable ? 'Create Policies' : 'Create Table'}
				</Button>
			</div>
		</form>
	);
};
