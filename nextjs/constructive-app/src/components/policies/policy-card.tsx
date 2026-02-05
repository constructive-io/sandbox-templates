'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@constructive-io/ui/button';
import { Combobox, ComboboxInput, ComboboxItem, ComboboxList, ComboboxPopup } from '@constructive-io/ui/combobox';
import { Input } from '@constructive-io/ui/input';
import { Label } from '@constructive-io/ui/label';
import { ResponsiveDiagram } from '@constructive-io/ui/responsive-diagram';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectRichItem,
	SelectTrigger,
	SelectValue,
} from '@constructive-io/ui/select';
import type { CardComponent } from '@constructive-io/ui/stack';
import { Switch } from '@constructive-io/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@constructive-io/ui/tabs';
import { showErrorToast, showSuccessToast } from '@constructive-io/ui/toast';
import { Tooltip, TooltipContent, TooltipTrigger } from '@constructive-io/ui/tooltip';
import { useQueryClient } from '@tanstack/react-query';
import { Check, Circle, Loader2Icon } from 'lucide-react';

import { useSchemaBuilderSelectors } from '@/lib/gql/hooks/schema-builder';
import type { PolicyFieldType } from '@/lib/gql/hooks/schema-builder/policies/use-create-policy-field';
import type { DatabasePolicy } from '@/lib/gql/hooks/schema-builder/policies/use-database-policies';
import {
	databasePoliciesQueryKeys,
	useDatabasePolicies,
} from '@/lib/gql/hooks/schema-builder/policies/use-database-policies';
import { mapConditionNodeToAst } from '@/lib/policies/ast-helpers';
import { mapAstToConditionNode } from '@/lib/policies/rls-parser';
import { cn } from '@/lib/utils';
import { usePolicyFilters } from '@/store/app-store';
import {
	useCreatePolicyMutation,
	useUpdatePolicyMutation,
} from '@sdk/app-public';

import type { ConditionGroupNode } from './condition-builder/types';
import { CreateFieldCard } from './create-field-card';
import { CreateTableCard } from './create-table-card';
import type { PolicyConditionData, PolicyRole, PolicyTypeKey } from './policies.types';
import { POLICY_PRIVILEGES, POLICY_ROLES } from './policies.types';
import { createInitialConditionRoot, createNewPolicyCondition, isSystemTable } from './policies.utils';
import { PolicyConditionBuilder } from './policy-condition-builder';
import { PolicyDiagram } from './policy-diagram';
import { PolicyPreview } from './policy-preview';
import { TemplateFieldsRenderer } from './template-fields';
import type { FieldCreationContext } from './template-fields/field-renderers';
import {
	fromBackendPolicyTypeId,
	getDefaultData,
	getPolicyTypeLabel,
	isCompositeConditionTreeValid,
	isPolicyTypeDataValid,
	POLICY_TYPE_LIST,
	sanitizePolicyTypeData,
	toBackendPolicyTypeId,
	type PolicyTypeId,
} from './template-schema';

export type PolicyCardProps = {
	selectedTableId?: string;
	editingPolicy?: DatabasePolicy & { tableId: string };
	onSuccess?: () => void;
};

type ConfigTab = 'types' | 'advanced';

const nonCompositePolicyTypes = POLICY_TYPE_LIST.filter(
	(policyType) => policyType.astNode !== null || policyType.id !== 'AuthzComposite',
);

export const PolicyCard: CardComponent<PolicyCardProps> = ({ selectedTableId, editingPolicy, onSuccess, card }) => {
	const isEditMode = Boolean(editingPolicy);
	const [activePolicyType, setActivePolicyType] = useState<PolicyTypeId | 'AuthzComposite'>('AuthzDirectOwner');
	const [configTab, setConfigTab] = useState<ConfigTab>('types');
	const [selectedTable, setSelectedTable] = useState('');
	const [policyName, setPolicyName] = useState('');
	const [policyNameTouched, setPolicyNameTouched] = useState(false);
	const [roleName, setRoleName] = useState<PolicyRole>('authenticated');
	const [privilege, setPrivilege] = useState('');
	const [isPermissive, setIsPermissive] = useState(true);
	const [isEnabled, setIsEnabled] = useState(true);
	const [conditionRoot, setConditionRoot] =
		useState<ConditionGroupNode<PolicyConditionData>>(createInitialConditionRoot);
	const [policyTypeData, setPolicyTypeData] = useState<Record<string, unknown>>(getDefaultData('AuthzDirectOwner'));

	const { currentDatabase } = useSchemaBuilderSelectors();
	const { showSystemTables } = usePolicyFilters();

	const databaseId = currentDatabase?.databaseId ?? '';
	const schemaId = currentDatabase?.schemaId ?? '';
	const { data: allTablesData = [] } = useDatabasePolicies(databaseId, { enabled: Boolean(databaseId) });
	const tablesData = allTablesData.filter((table) => showSystemTables || !isSystemTable(table.category));
	const queryClient = useQueryClient();
	const createPolicyMutation = useCreatePolicyMutation({
		onSuccess: () => {
			if (databaseId) {
				queryClient.invalidateQueries({ queryKey: databasePoliciesQueryKeys.byDatabase(databaseId) });
			}
		},
	});
	const updatePolicyMutation = useUpdatePolicyMutation({
		onSuccess: () => {
			if (databaseId) {
				queryClient.invalidateQueries({ queryKey: databasePoliciesQueryKeys.byDatabase(databaseId) });
			}
		},
	});

	const tableComboboxData = tablesData.map((table) => ({
		label: table.name,
		value: table.id,
	}));

	const selectedTableOption = tableComboboxData.find((o) => o.value === selectedTable) ?? null;

	const selectedTableData = tablesData.find((table) => table.id === selectedTable);
	const tableFields =
		selectedTableData?.fields
			?.slice()
			.sort((a, b) => (a.fieldOrder ?? 0) - (b.fieldOrder ?? 0))
			.map((field) => ({ name: field.name, type: field.type ?? null })) ?? [];

	useEffect(() => {
		if (editingPolicy) {
			setSelectedTable(editingPolicy.tableId);
			setPolicyName(editingPolicy.name ?? '');
			setRoleName((editingPolicy.roleName ?? 'authenticated') as PolicyRole);
			setPrivilege(editingPolicy.privilege ?? '');
			setIsPermissive(editingPolicy.permissive ?? true);
			setIsEnabled(!editingPolicy.disabled);
			const policyType =
				fromBackendPolicyTypeId(
					(editingPolicy.policyType ?? 'AuthzDirectOwner') as string,
					(editingPolicy.data as Record<string, unknown> | null | undefined) ?? null,
				) ?? ((editingPolicy.policyType ?? 'AuthzDirectOwner') as PolicyTypeId | 'AuthzComposite');
			setActivePolicyType(policyType);
			if (policyType === 'AuthzComposite') {
				setConfigTab('advanced');
				if (editingPolicy.data) {
					setConditionRoot(mapAstToConditionNode(editingPolicy.data as Record<string, unknown>));
				}
			} else {
				setConfigTab('types');
				if (editingPolicy.data) {
					setPolicyTypeData(editingPolicy.data as Record<string, unknown>);
				}
			}
		} else if (selectedTableId) {
			setSelectedTable(selectedTableId);
		}
	}, [selectedTableId, editingPolicy]);

	const handlePolicyTypeChange = (newPolicyType: string) => {
		const policyTypeId = newPolicyType as PolicyTypeId | 'AuthzComposite';
		setActivePolicyType(policyTypeId);
		if (policyTypeId !== 'AuthzComposite') {
			setPolicyTypeData(getDefaultData(policyTypeId));
		}
	};

	// Handlers for nested cards
	const handleOpenTableCard = useCallback(() => {
		card.push({
			id: 'policy-table-create',
			title: 'Create New Table',
			description: 'Create a new table for your policy configuration.',
			Component: CreateTableCard,
			props: {
				databaseId,
				schemaId,
				onTableCreated: (tableName: string) => {
					// Find the newly created table and update policyTypeData
					const newTable = tablesData.find((t) => t.name === tableName);
					if (newTable) {
						setPolicyTypeData((prev) => {
							const updates: Record<string, unknown> = {};
							if ('owned_table' in prev || activePolicyType === 'AuthzArrayContainsActorByJoin') {
								updates.owned_table = tableName;
								updates.owned_schema = newTable.schema?.schemaName || '';
							}
							if ('obj_table' in prev || activePolicyType === 'AuthzMembershipByJoin') {
								updates.obj_table = tableName;
								updates.obj_schema = newTable.schema?.schemaName || '';
							}
							return { ...prev, ...updates };
						});
					}
				},
			},
			width: 480,
		});
	}, [card, databaseId, schemaId, tablesData, activePolicyType]);

	const handleOpenFieldCard = useCallback(
		(fieldType: PolicyFieldType, context?: FieldCreationContext) => {
			if (context) {
				const fieldTypeLabel = fieldType === 'uuid[]' ? 'UUID Array' : 'UUID';
				card.push({
					id: `policy-field-create-${context.tableId}`,
					title: 'Create New Field',
					description: `Add a ${fieldTypeLabel.toLowerCase()} field to ${context.tableName}`,
					Component: CreateFieldCard,
					props: {
						databaseId,
						tableId: context.tableId,
						tableName: context.tableName,
						fieldType,
						existingFields: tablesData.find((t) => t.id === context.tableId)?.fields ?? [],
						onFieldCreated: (fieldName: string) => {
							// Update the appropriate field in policyTypeData
							setPolicyTypeData((prev) => {
								const isArrayField = fieldType === 'uuid[]';
								if (isArrayField) {
									return { ...prev, owned_table_key: fieldName };
								}
								const fieldKeys = ['entity_field', 'this_object_key', 'owned_table_ref_key', 'sel_field', 'obj_field'];
								for (const key of fieldKeys) {
									if (key in prev && !prev[key]) {
										return { ...prev, [key]: fieldName };
									}
								}
								if ('entity_field' in prev) {
									return { ...prev, entity_field: fieldName };
								}
								return prev;
							});
						},
					},
					width: 480,
				});
			}
		},
		[card, databaseId, tablesData],
	);

	// Field creation context for the current selected table
	const fieldCreationContext: FieldCreationContext | undefined = useMemo(() => {
		if (!selectedTableData || !databaseId) return undefined;
		return {
			databaseId,
			tableId: selectedTableData.id,
			tableName: selectedTableData.name,
		};
	}, [selectedTableData, databaseId]);

	const getPolicyTypeData = useCallback(() => {
		if (activePolicyType === 'AuthzComposite') {
			return mapConditionNodeToAst(conditionRoot) ?? {};
		}
		return sanitizePolicyTypeData(activePolicyType, policyTypeData);
	}, [activePolicyType, policyTypeData, conditionRoot]);

	const isPolicyTypeValid = useMemo(() => {
		if (activePolicyType === 'AuthzComposite') {
			return isCompositeConditionTreeValid(conditionRoot);
		}
		return isPolicyTypeDataValid(activePolicyType, policyTypeData);
	}, [activePolicyType, policyTypeData, conditionRoot]);

	const isFormValid = useMemo(() => {
		const hasTable = Boolean(selectedTable);
		const hasName = Boolean(policyName.trim());
		const hasRole = Boolean(roleName);
		const hasPrivilege = Boolean(privilege);
		return hasTable && hasName && hasRole && hasPrivilege && isPolicyTypeValid;
	}, [selectedTable, policyName, roleName, privilege, isPolicyTypeValid]);

	const hasChanges = useMemo(() => {
		if (!isEditMode || !editingPolicy) return true;

		const currentData = getPolicyTypeData();
		const hasNameChange = (policyName || null) !== (editingPolicy.name || null);
		const hasRoleChange = (roleName || null) !== (editingPolicy.roleName || null);
		const hasPrivilegeChange = (privilege || null) !== (editingPolicy.privilege || null);
		const hasPermissiveChange = isPermissive !== (editingPolicy.permissive ?? true);
		const hasEnabledChange = isEnabled !== !editingPolicy.disabled;
		const hasPolicyTypeChange = activePolicyType !== (editingPolicy.policyType ?? 'AuthzDirectOwner');
		const hasDataChange = JSON.stringify(currentData) !== JSON.stringify(editingPolicy.data ?? {});

		return (
			hasNameChange ||
			hasRoleChange ||
			hasPrivilegeChange ||
			hasPermissiveChange ||
			hasEnabledChange ||
			hasPolicyTypeChange ||
			hasDataChange
		);
	}, [
		isEditMode,
		editingPolicy,
		getPolicyTypeData,
		policyName,
		roleName,
		privilege,
		isPermissive,
		isEnabled,
		activePolicyType,
	]);

	const handleSubmit = async () => {
		if (!selectedTable) {
			showErrorToast({
				message: 'Table is required',
				description: 'Please select a table for the policy.',
			});
			return;
		}

		if (!databaseId) {
			showErrorToast({
				message: 'Database not found',
				description: 'Please ensure a database is selected.',
			});
			return;
		}

		try {
			const data = getPolicyTypeData();

			if (isEditMode && editingPolicy) {
				await updatePolicyMutation.mutateAsync({
					input: {
						id: editingPolicy.id,
						patch: {
							name: policyName || null,
							roleName: roleName || null,
							privilege: privilege || null,
							permissive: isPermissive,
							disabled: !isEnabled,
							policyType: toBackendPolicyTypeId(activePolicyType),
							data,
						},
					},
				});

				showSuccessToast({
					message: 'Policy updated successfully!',
					description: policyName ? `Policy "${policyName}" has been updated.` : 'Your policy has been updated.',
				});
			} else {
				await createPolicyMutation.mutateAsync({
					input: {
						policy: {
							databaseId,
							tableId: selectedTable,
							name: policyName || null,
							roleName: roleName || null,
							privilege: privilege || null,
							permissive: isPermissive,
							disabled: !isEnabled,
							policyType: toBackendPolicyTypeId(activePolicyType),
							data,
						},
					},
				});

				showSuccessToast({
					message: 'Policy created successfully!',
					description: policyName ? `Policy "${policyName}" has been created.` : 'Your policy has been created.',
				});
			}

			onSuccess?.();
			card.close();
		} catch (error) {
			console.error('Failed to create policy:', error);
			showErrorToast({
				message: 'Failed to create policy',
				description: error instanceof Error ? error.message : 'An unexpected error occurred.',
			});
		}
	};

	return (
		<div className='flex h-full flex-col'>
			{/* Content */}
			<div className='scrollbar-neutral-thin min-h-0 flex-1 overflow-y-auto'>
				<div className='space-y-6 p-4'>
					{/* Basics Section */}
					<div className='space-y-3'>
						<p className='text-muted-foreground text-xs font-semibold tracking-wide uppercase'>Basics</p>
						<div className='grid gap-3 sm:grid-cols-2'>
							<div className='space-y-1.5 sm:col-span-2'>
								<Label htmlFor='table-select'>Table</Label>
								<Combobox
									items={tableComboboxData}
									value={selectedTableOption}
									onValueChange={(next) => setSelectedTable(next?.value ?? '')}
								>
									<ComboboxInput id='table-select' placeholder='Search tables...' showClear={false} />
									<ComboboxPopup>
										<ComboboxList className='scrollbar-neutral-thin max-h-20 overflow-y-auto'>
											{(table: (typeof tableComboboxData)[number]) => (
												<ComboboxItem key={table.value} value={table}>
													<span className='truncate'>{table.label}</span>
												</ComboboxItem>
											)}
										</ComboboxList>
									</ComboboxPopup>
								</Combobox>
							</div>
							<div className='space-y-1.5 sm:col-span-2'>
								<Label htmlFor='policy-name'>Policy name</Label>
								<Input
									id='policy-name'
									placeholder='Enter a unique policy name'
									autoComplete='off'
									value={policyName}
									onChange={(e) => {
										setPolicyName(e.target.value);
										if (!policyNameTouched) {
											setPolicyNameTouched(true);
										}
									}}
									className={cn(policyNameTouched && !policyName.trim() && 'border-destructive')}
								/>
								{policyNameTouched && !policyName.trim() && (
									<p className='text-destructive text-xs'>Policy name cannot be empty</p>
								)}
							</div>
							<div className='space-y-1.5'>
								<Label htmlFor='policy-privilege'>Privilege</Label>
								<Select value={privilege} onValueChange={setPrivilege}>
									<SelectTrigger id='policy-privilege'>
										<SelectValue placeholder='Select a privilege' />
									</SelectTrigger>
									<SelectContent>
										{POLICY_PRIVILEGES.map((priv) => (
											<SelectItem key={priv.value} value={priv.value}>
												{priv.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className='space-y-1.5'>
								<Label htmlFor='policy-role'>Role</Label>
								<Select value={roleName} onValueChange={(v) => setRoleName(v as PolicyRole)}>
									<SelectTrigger id='policy-role'>
										<SelectValue placeholder='Select a role' />
									</SelectTrigger>
									<SelectContent>
										{POLICY_ROLES.map((role) => (
											<SelectItem key={role.value} value={role.value}>
												{role.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
						<div className='grid gap-4 sm:grid-cols-2'>
							<div className='space-y-1.5'>
								<Label htmlFor='policy-mode'>Policy mode</Label>
								<Select
									value={isPermissive ? 'permissive' : 'restrictive'}
									onValueChange={(v) => setIsPermissive(v === 'permissive')}
								>
									<SelectTrigger id='policy-mode'>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectRichItem
											value='permissive'
											label='Permissive'
											description='Allows access when any permissive policy matches'
										/>
										<SelectRichItem
											value='restrictive'
											label='Restrictive'
											description='All restrictive policies must pass for access'
										/>
									</SelectContent>
								</Select>
							</div>
							<div className='space-y-1.5'>
								<Label>Status</Label>
								<div className='flex items-center justify-between rounded-md border px-3 py-2 text-xs sm:text-sm'>
									<label htmlFor='policy-status' className='cursor-pointer'>
										Enabled
									</label>
									<Switch id='policy-status' checked={isEnabled} onCheckedChange={setIsEnabled} />
								</div>
							</div>
						</div>
					</div>

					{/* Configuration Section */}
					<div className='scrollbar-neutral-thin min-w-0 space-y-3 overflow-x-auto'>
						<p className='text-muted-foreground text-xs font-semibold tracking-wide uppercase'>Configuration</p>
						<Tabs
							value={configTab}
							onValueChange={(val) => {
								const next = val === 'advanced' ? 'advanced' : 'types';
								setConfigTab(next);
								setActivePolicyType(next === 'advanced' ? 'AuthzComposite' : 'AuthzDirectOwner');
							}}
						>
							<TabsList>
								<TabsTrigger value='types'>Policy Types</TabsTrigger>
								<TabsTrigger value='advanced'>Advanced</TabsTrigger>
							</TabsList>

							{/* Policy Types Tab Content */}
							{configTab === 'types' && (
								<div className='scrollbar-neutral-thin mt-4 flex min-w-0 flex-col gap-4 md:h-[500px] md:flex-row'>
									{/* Left: Policy Type List */}
									<div className='flex w-full shrink-0 flex-col rounded-lg border p-3 pr-0 md:w-72'>
										<p className='text-muted-foreground mb-2 text-xs font-medium'>Select a policy type</p>
										<div className='scrollbar-neutral-thin min-h-0 flex-1 overflow-y-auto'>
											<div className='space-y-2 pr-2'>
												{nonCompositePolicyTypes.map((policyTypeItem) => {
													const isActive = activePolicyType === policyTypeItem.id;
													const Icon = policyTypeItem.icon;

													const buttonContent = (
														<button
															type='button'
															onClick={() => handlePolicyTypeChange(policyTypeItem.id)}
															className={cn(
																`relative flex w-full items-start gap-3 rounded-lg border px-3 py-3 text-left
																transition-colors`,
																isActive ? 'border-primary bg-primary/5' : 'hover:bg-muted border-border/60',
															)}
														>
															<Icon
																className={cn(
																	'mt-0.5 h-5 w-5 shrink-0',
																	isActive ? 'text-primary' : 'text-muted-foreground',
																)}
															/>
															<div className='min-w-0 flex-1 pr-5'>
																<p className={cn('text-sm font-medium', isActive && 'text-primary')}>
																	{policyTypeItem.label}
																</p>
																<p className='text-muted-foreground mt-0.5 text-xs leading-snug'>
																	{policyTypeItem.description}
																</p>
															</div>
															<span className='absolute top-3 right-3'>
																{isActive ? (
																	<span className='bg-primary flex h-4 w-4 items-center justify-center rounded-full'>
																		<Check className='h-2.5 w-2.5 text-white' />
																	</span>
																) : (
																	<Circle className='text-muted-foreground/50 h-4 w-4' />
																)}
															</span>
														</button>
													);

													return (
														<div key={policyTypeItem.id}>
															<div className='hidden md:block'>
																<Tooltip delayDuration={100}>
																	<TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
																	<TooltipContent side='right' sideOffset={12} className='w-fit max-w-none p-0'>
																		<div className='max-w-[320px] space-y-3 p-3 shadow-xl'>
																			<div className='space-y-1'>
																				<p className='text-sm font-semibold'>{policyTypeItem.label}</p>
																				<p className='text-muted-foreground text-xs'>{policyTypeItem.description}</p>
																				<p className='text-muted-foreground text-xs italic'>
																					{policyTypeItem.explanation}
																				</p>
																			</div>
																			<ResponsiveDiagram className='rounded-md border-0 p-2'>
																				<PolicyDiagram
																					policyType={policyTypeItem.id as PolicyTypeKey}
																					tableName={selectedTableData?.name ?? 'Table'}
																				/>
																			</ResponsiveDiagram>
																		</div>
																	</TooltipContent>
																</Tooltip>
															</div>
															<div className='md:hidden'>{buttonContent}</div>
														</div>
													);
												})}
											</div>
										</div>
									</div>

									{/* Right: Title + Diagram + Policy Type Fields */}
									<div className='scrollbar-neutral-thin min-w-0 flex-1 overflow-y-auto rounded-lg border p-4'>
										{activePolicyType !== 'AuthzComposite' && (
											<div className='space-y-4'>
												<div className='space-y-1'>
													<p className='text-foreground text-base font-semibold'>
														{getPolicyTypeLabel(activePolicyType, policyTypeData)}
													</p>
													<p className='text-muted-foreground text-sm'>
														{nonCompositePolicyTypes.find((t) => t.id === activePolicyType)?.description}
													</p>
													<p className='text-muted-foreground text-sm italic'>
														{nonCompositePolicyTypes.find((t) => t.id === activePolicyType)?.explanation}
													</p>
												</div>

												<ResponsiveDiagram>
													<PolicyDiagram
														policyType={activePolicyType as PolicyTypeKey}
														tableName={selectedTableData?.name ?? 'Table'}
														data={policyTypeData}
													/>
												</ResponsiveDiagram>

												<PolicyPreview policyTypeId={activePolicyType} data={policyTypeData} />

												<TemplateFieldsRenderer
													key={`policy-type-fields-${activePolicyType}`}
													policyTypeId={activePolicyType}
													data={policyTypeData}
													onChange={(updates) => {
														setPolicyTypeData((prev) => ({ ...prev, ...updates }));
													}}
													variant='full'
													fields={tableFields}
													tables={tablesData}
													singleColumn
													onCreateTable={handleOpenTableCard}
													onCreateField={handleOpenFieldCard}
													fieldCreationContext={fieldCreationContext}
												/>
											</div>
										)}
									</div>
								</div>
							)}

							{/* Advanced Tab Content */}
							{configTab === 'advanced' && (
								<div className='mt-4 min-w-0'>
									<PolicyConditionBuilder
										conditionRoot={conditionRoot}
										onConditionRootChange={setConditionRoot}
										createNewCondition={createNewPolicyCondition}
										fields={tableFields}
										tables={tablesData}
										onCreateTable={handleOpenTableCard}
										onCreateField={handleOpenFieldCard}
										fieldCreationContext={fieldCreationContext}
										fieldDrawerOpen={false}
									/>
								</div>
							)}
						</Tabs>
					</div>
				</div>
			</div>

			{/* Footer */}
			<div className='flex justify-end gap-2 border-t px-4 py-3'>
				<Button
					variant='outline'
					onClick={() => card.close()}
					disabled={createPolicyMutation.isPending || updatePolicyMutation.isPending}
				>
					Cancel
				</Button>
				<Button
					onClick={handleSubmit}
					disabled={
						createPolicyMutation.isPending ||
						updatePolicyMutation.isPending ||
						!isFormValid ||
						(isEditMode && !hasChanges)
					}
				>
					{(createPolicyMutation.isPending || updatePolicyMutation.isPending) && (
						<Loader2Icon className='h-4 w-4 animate-spin' />
					)}
					{createPolicyMutation.isPending || updatePolicyMutation.isPending
						? isEditMode
							? 'Updating...'
							: 'Creating...'
						: isEditMode
							? 'Update policy'
							: 'Create policy'}
				</Button>
			</div>
		</div>
	);
};
