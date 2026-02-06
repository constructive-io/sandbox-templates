'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@constructive-io/ui/button';
import { Input } from '@constructive-io/ui/input';
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
import type { CardComponent } from '@constructive-io/ui/stack';
import { Switch } from '@constructive-io/ui/switch';
import { showErrorToast, showSuccessToast } from '@constructive-io/ui/toast';
import { Loader2Icon } from 'lucide-react';

import { useSchemaBuilderSelectors } from '@/lib/gql/hooks/schema-builder';
import type { PolicyFieldType } from '@/lib/gql/hooks/schema-builder/policies/use-create-policy-field';
import { useDatabasePolicies } from '@/lib/gql/hooks/schema-builder/policies/use-database-policies';
import { usePermissions } from '@/lib/gql/hooks/schema-builder/policies/use-permissions';
import { CreateFieldCard } from '@/components/policies/create-field-card';
import {
	MEMBERSHIP_TYPE_OPTIONS,
	MEMBERSHIP_TYPES,
	POLICY_PRIVILEGES,
	POLICY_ROLES,
	type PolicyRole,
} from '@/components/policies/policies.types';
import { PolicyDiagram } from '@/components/policies/policy-diagram';
import { PolicyPreview } from '@/components/policies/policy-preview';
import type { FieldCreationContext } from '@/components/policies/template-fields/field-renderers';
import { POLICY_TYPE_SCHEMAS, type PolicyTypeId } from '@/components/policies/template-schema';

import {
	buildPolicyData,
	getAccessModel,
	getDefaultFieldNames,
	requiresExternalTable,
	type AccessModelId,
} from './access-model-types';
import {
	createInitialExternalTableState,
	ExternalTableConfig,
	getExternalTablePolicyData,
	type ExternalTableState,
} from './external-table-config';
import { MultiValueFieldEditor } from './multi-value-field-editor';
import { useTableWithPolicyCreation } from './use-table-with-policy-creation';

export interface TableWithPolicyConfigCardProps {
	tableName: string;
	selectedModel: AccessModelId;
	onTableCreated?: (table: { id: string; name: string }) => void;
	onComplete?: () => void;
}

const EXTERNAL_TABLE_FIELD_KEYS = new Set([
	'owned_table',
	'owned_schema',
	'owned_table_key',
	'owned_table_ref_key',
	'obj_table',
	'obj_schema',
	'sel_field',
	'obj_field',
]);

export const TableWithPolicyConfigCard: CardComponent<TableWithPolicyConfigCardProps> = ({
	tableName,
	selectedModel,
	onTableCreated,
	onComplete,
	card,
}) => {
	const model = getAccessModel(selectedModel);
	const needsExternalTable = requiresExternalTable(selectedModel);
	const policySchema = POLICY_TYPE_SCHEMAS[selectedModel as PolicyTypeId];

	const { currentDatabase, currentSchema } = useSchemaBuilderSelectors();
	const databaseId = currentDatabase?.databaseId ?? '';
	const schemaId = currentDatabase?.schemaId ?? '';
	const schemaName = currentSchema?.metadata?.schemaName ?? 'public';

	const { data: tablesData = [] } = useDatabasePolicies(databaseId, { enabled: Boolean(databaseId) });
	const { data: permissions, isLoading: isPermissionsLoading } = usePermissions({ enabled: Boolean(databaseId) });

	const { create, isPending } = useTableWithPolicyCreation();

	const [policyName, setPolicyName] = useState('');
	const policyNameRef = useRef<HTMLInputElement>(null);
	const [roleName, setRoleName] = useState<PolicyRole>(model.policyConfig.roleName);
	const [privilege, setPrivilege] = useState(model.policyConfig.privilege);
	const [isPermissive, setIsPermissive] = useState(model.policyConfig.isPermissive);
	const [isEnabled, setIsEnabled] = useState(model.policyConfig.isEnabled);

	// Policy-specific data (field names, table names, etc.)
	const [policyData, setPolicyData] = useState<Record<string, unknown>>(() => getDefaultFieldNames(selectedModel));

	// External table state
	const [externalTableState, setExternalTableState] = useState<ExternalTableState>(() =>
		createInitialExternalTableState(model.externalTable, 'new'),
	);

	useEffect(() => {
		const nextModel = getAccessModel(selectedModel);
		setPolicyName('');
		setRoleName(nextModel.policyConfig.roleName);
		setPrivilege(nextModel.policyConfig.privilege);
		setIsPermissive(nextModel.policyConfig.isPermissive);
		setIsEnabled(nextModel.policyConfig.isEnabled);
		setPolicyData(() => {
			const base = getDefaultFieldNames(selectedModel);
			if (selectedModel === 'AuthzMembership') {
				return {
					...base,
					is_admin: true,
				};
			}
			return base;
		});
		setExternalTableState(createInitialExternalTableState(nextModel.externalTable, 'new'));

		requestAnimationFrame(() => {
			policyNameRef.current?.focus();
		});
	}, [selectedModel]);

	useEffect(() => {
		requestAnimationFrame(() => {
			policyNameRef.current?.focus();
		});
	}, []);

	const selectedExistingTable = useMemo(
		() => tablesData.find((t) => t.id === externalTableState.existingTableId),
		[tablesData, externalTableState.existingTableId],
	);

	const policyDataForPreview = useMemo(() => {
		// Build external table info for preview
		let externalInfo: { schema: string; tableName: string } | undefined;
		if (needsExternalTable && model.externalTable) {
			if (externalTableState.mode === 'existing' && selectedExistingTable) {
				externalInfo = {
					schema: selectedExistingTable.schema?.schemaName ?? schemaName,
					tableName: selectedExistingTable.name,
				};
			} else {
				externalInfo = {
					schema: schemaName,
					tableName: externalTableState.newTableName || model.externalTable.defaultTableName,
				};
			}
		}

		// Filter to only string values for buildPolicyData
		const stringFieldNames: Record<string, string> = {};
		for (const [key, value] of Object.entries(policyData)) {
			if (typeof value === 'string') {
				stringFieldNames[key] = value;
			} else if (Array.isArray(value)) {
				const first = value.find((v) => typeof v === 'string' && v.trim() !== '');
				if (typeof first === 'string') {
					stringFieldNames[key] = first;
				}
			}
		}

		// Merge external table field values into stringFieldNames
		if (needsExternalTable && model.externalTable) {
			const extData = getExternalTablePolicyData(externalTableState, model.externalTable, schemaName);
			Object.assign(stringFieldNames, extData);
		}

		const built = buildPolicyData(selectedModel, stringFieldNames, externalInfo);
		if (selectedModel === 'AuthzDirectOwnerAny') {
			const raw = policyData.entity_fields;
			const entityFields = Array.isArray(raw)
				? raw.filter((v): v is string => typeof v === 'string' && v.trim() !== '')
				: typeof raw === 'string' && raw.trim()
					? [raw]
					: [];
			return {
				...built,
				entity_fields: entityFields,
			};
		}

		return built;
	}, [
		selectedModel,
		policyData,
		needsExternalTable,
		externalTableState,
		selectedExistingTable,
		schemaName,
		model.externalTable,
	]);

	const externalTableValid = useMemo(() => {
		if (!needsExternalTable) return true;
		if (externalTableState.mode === 'existing') {
			return Boolean(externalTableState.existingTableId);
		}
		const trimmed = externalTableState.newTableName.trim();
		if (!trimmed) return false;
		return true;
	}, [needsExternalTable, externalTableState]);

	const isFormValid = useMemo(() => {
		if (!externalTableValid) return false;
		if (!policyName.trim()) return false;
		if (!privilege) return false;
		return true;
	}, [externalTableValid, policyName, privilege]);

	const handleFieldNameChange = (key: string, value: string) => {
		setPolicyData((prev) => ({ ...prev, [key]: value }));
	};

	const handleOpenFieldCard = useCallback(
		(fieldType: PolicyFieldType, context?: FieldCreationContext) => {
			if (context) {
				card.push({
					id: `table-policy-field-create-${context.tableId}`,
					title: 'Create New Field',
					Component: CreateFieldCard,
					props: {
						databaseId,
						tableId: context.tableId,
						tableName: context.tableName,
						fieldType,
						existingFields: tablesData.find((t) => t.id === context.tableId)?.fields ?? [],
						onFieldCreated: (fieldName: string) => {
							// Update the external table field value
							setExternalTableState((prev) => ({
								...prev,
								fieldValues: {
									...prev.fieldValues,
									// Find the first empty field that matches this type
									...(fieldType === 'uuid[]' ? { owned_table_key: fieldName } : {}),
								},
							}));
						},
					},
				});
			}
		},
		[card, databaseId, tablesData],
	);

	const handleSubmit = async () => {
		if (!isFormValid || !databaseId || !schemaId) return;

		try {
			const fieldNames: Record<string, string> = {};
			for (const [key, value] of Object.entries(policyData)) {
				if (typeof value === 'string') {
					fieldNames[key] = value;
				} else if (Array.isArray(value)) {
					const first = value.find((v) => typeof v === 'string' && v.trim() !== '');
					if (typeof first === 'string') {
						fieldNames[key] = first;
					}
				}
			}

			// Merge external table field values
			if (needsExternalTable && model.externalTable) {
				const extData = getExternalTablePolicyData(externalTableState, model.externalTable, schemaName);
				Object.assign(fieldNames, extData);
			}

			// Build existingFieldIds mapping for FK creation when using existing table
			let existingFieldIds: Record<string, string> | undefined;
			if (needsExternalTable && externalTableState.mode === 'existing' && selectedExistingTable) {
				existingFieldIds = {};
				// Map field keys to field IDs by looking up field names in the selected table
				for (const [fieldKey, fieldName] of Object.entries(externalTableState.fieldValues)) {
					const field = selectedExistingTable.fields.find((f) => f.name === fieldName);
					if (field) {
						existingFieldIds[fieldKey] = field.id;
					}
				}
			}

			const result = await create({
				modelId: selectedModel,
				tableName: tableName.trim(),
				databaseId,
				schemaId,
				schemaName,
				fieldNames,
				externalTable: needsExternalTable
					? {
							useExisting: externalTableState.mode === 'existing',
							existingTableId: externalTableState.mode === 'existing' ? externalTableState.existingTableId : undefined,
							existingTableName:
								externalTableState.mode === 'existing' ? externalTableState.existingTableName : undefined,
							existingTableSchema:
								externalTableState.mode === 'existing' ? externalTableState.existingTableSchema : undefined,
							existingFieldIds,
							newTableName: externalTableState.mode === 'new' ? externalTableState.newTableName : undefined,
						}
					: undefined,
				policyConfig: model.createsPolicy
					? {
							name: policyName.trim(),
							roleName,
							privilege,
							isPermissive,
							isEnabled,
						}
					: undefined,
			});

			showSuccessToast({
				message: 'Table created successfully!',
				description: model.createsPolicy
					? `Table "${result.name}" with ${model.label} policy has been created.`
					: `Table "${result.name}" has been created.`,
			});

			onTableCreated?.(result);
			onComplete?.();
			card.close();
		} catch (error) {
			showErrorToast({
				message: 'Failed to create table',
				description: error instanceof Error ? error.message : 'An unexpected error occurred.',
			});
		}
	};

	const handleFormSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (isFormValid && !isPending) {
			handleSubmit();
		}
	};

	return (
		<form onSubmit={handleFormSubmit} className='flex h-full flex-col'>
			<ScrollArea className='min-h-0 flex-1'>
				<div className='space-y-6 p-6'>
					{/* Basic Configuration - ON TOP */}
					{model.createsPolicy && (
						<div className='space-y-3'>
							<p className='text-muted-foreground text-xs font-semibold tracking-wide uppercase'>Policy Settings</p>
							<div className='grid gap-3 sm:grid-cols-2'>
								<div className='space-y-1.5 sm:col-span-2'>
									<Label htmlFor='policy-name'>
										Policy Name <span className='text-destructive'>*</span>
									</Label>
									<Input
										id='policy-name'
										ref={policyNameRef}
										value={policyName}
										onChange={(e) => setPolicyName(e.target.value)}
										placeholder='Enter a unique policy name'
										autoComplete='off'
									/>
								</div>

								<div className='space-y-1.5'>
									<Label htmlFor='policy-privilege'>Privilege</Label>
									<Select value={privilege} onValueChange={setPrivilege}>
										<SelectTrigger id='policy-privilege'>
											<SelectValue placeholder='Select privilege' />
										</SelectTrigger>
										<SelectContent>
											{POLICY_PRIVILEGES.map((p) => (
												<SelectItem key={p.value} value={p.value}>
													{p.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div className='space-y-1.5'>
									<Label htmlFor='policy-role'>Role</Label>
									<Select value={roleName} onValueChange={(v) => setRoleName(v as PolicyRole)}>
										<SelectTrigger id='policy-role'>
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
									<Label htmlFor='policy-mode'>Mode</Label>
									<Select
										value={isPermissive ? 'permissive' : 'restrictive'}
										onValueChange={(v) => setIsPermissive(v === 'permissive')}
									>
										<SelectTrigger id='policy-mode'>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectRichItem value='permissive' label='Permissive' description='Allows access when matched' />
											<SelectRichItem value='restrictive' label='Restrictive' description='Must pass for access' />
										</SelectContent>
									</Select>
								</div>

								<div className='space-y-1.5'>
									<Label>Status</Label>
									<div className='flex items-center justify-between rounded-md border px-3 py-2'>
										<label htmlFor='policy-status' className='cursor-pointer text-sm'>
											Enabled
										</label>
										<Switch id='policy-status' checked={isEnabled} onCheckedChange={setIsEnabled} />
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Configuration Section */}
					<div className='space-y-3'>
						<p className='text-muted-foreground text-xs font-semibold tracking-wide uppercase'>Access Rule</p>

						{/* Policy Type Info */}
						{policySchema && (
							<div className='space-y-3 rounded-lg border p-4'>
								<div className='space-y-1'>
									<p className='text-sm font-semibold'>{policySchema.label}</p>
									<p className='text-muted-foreground text-sm'>{policySchema.description}</p>
									<p className='text-muted-foreground text-sm italic'>{policySchema.explanation}</p>
								</div>

								<ResponsiveDiagram>
									<PolicyDiagram
										policyType={selectedModel as Exclude<AccessModelId, 'blank'>}
										tableName={tableName}
										data={policyDataForPreview}
									/>
								</ResponsiveDiagram>

								<PolicyPreview policyTypeId={selectedModel as PolicyTypeId} data={policyDataForPreview} />
							</div>
						)}

						{/* Policy Type Fields (excluding external table fields) */}
						{policySchema && policySchema.fields.length > 0 && (
							<div className='grid gap-3'>
								{policySchema.fields
									.filter((field) => !EXTERNAL_TABLE_FIELD_KEYS.has(field.key))
									.map((field) => (
										<div key={field.key} className='space-y-1.5'>
											<Label htmlFor={`field-${field.key}`}>
												{field.label}
												{field.required && <span className='text-destructive ml-0.5'>*</span>}
											</Label>
											{field.key === 'entity_fields' && field.type === 'field-multi-select' && (
												<p className='text-muted-foreground text-xs'>Add field names for owner user IDs</p>
											)}
											{field.type === 'membership-type-select' ? (
												<Select
													value={
														policyData[field.key] === null || policyData[field.key] === undefined
															? ''
															: String(policyData[field.key])
													}
													onValueChange={(v) => {
														const nextMembershipType = v ? Number(v) : null;
														setPolicyData((prev) => ({
															...prev,
															[field.key]: nextMembershipType,
															permission: undefined,
														}));
													}}
												>
													<SelectTrigger id={`field-${field.key}`}>
														<SelectValue placeholder='Select membership type'>
															{(value) => {
																if (!value) return 'Select membership type';
																const opt = MEMBERSHIP_TYPE_OPTIONS.find((o) => String(o.value) === String(value));
																return opt?.label ?? String(value);
															}}
														</SelectValue>
													</SelectTrigger>
													<SelectContent>
														{MEMBERSHIP_TYPE_OPTIONS.map((opt) => (
															<SelectRichItem
																key={opt.value}
																value={String(opt.value)}
																label={opt.label}
																description={opt.description}
															/>
														))}
													</SelectContent>
												</Select>
											) : field.type === 'access-type-radio' ? (
												<div className='flex items-center justify-between rounded-md border px-3 py-2'>
													<label htmlFor={`field-${field.key}`} className='cursor-pointer text-sm'>
														Enabled
													</label>
													<Switch
														id={`field-${field.key}`}
														checked={Boolean(policyData[field.key])}
														onCheckedChange={(checked) => {
															setPolicyData((prev) => ({ ...prev, [field.key]: checked }));
														}}
														disabled={isPending}
													/>
												</div>
											) : field.type === 'permission-select' ? (
												<Select
													value={(policyData[field.key] as string) || ''}
													onValueChange={(v) => {
														setPolicyData((prev) => ({ ...prev, [field.key]: v || undefined }));
													}}
												>
													<SelectTrigger id={`field-${field.key}`}>
														<SelectValue placeholder={isPermissionsLoading ? 'Loading...' : 'Select permission'} />
													</SelectTrigger>
													<SelectContent className='max-h-48'>
														{(() => {
															const membershipType = (policyData.membership_type as number | null) ?? null;
															const isAppLevel = membershipType === MEMBERSHIP_TYPES.APP;
															const list = isAppLevel
																? (permissions?.appPermissions ?? [])
																: (permissions?.membershipPermissions ?? []);
															return list
																.filter((p) => p.name)
																.map((p) => (
																	<SelectRichItem
																		key={p.id}
																		value={p.name!}
																		label={p.name ?? undefined}
																		description={p.description}
																	/>
																));
														})()}
													</SelectContent>
												</Select>
											) : field.type === 'field-multi-select' ? (
												<MultiValueFieldEditor
													value={(policyData[field.key] as string[]) || []}
													onChange={(next) => setPolicyData((prev) => ({ ...prev, [field.key]: next }))}
													disabled={isPending}
												/>
											) : (
												<Input
													id={`field-${field.key}`}
													value={(policyData[field.key] as string) || ''}
													onChange={(e) => handleFieldNameChange(field.key, e.target.value)}
													placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
													className='font-mono'
												/>
											)}
											{field.key !== 'entity_fields' && field.description && (
												<p className='text-muted-foreground text-xs'>{field.description}</p>
											)}
										</div>
									))}
							</div>
						)}

						{/* External Table Configuration */}
						{needsExternalTable && model.externalTable && (
							<ExternalTableConfig
								config={model.externalTable}
								state={externalTableState}
								onChange={setExternalTableState}
								tables={tablesData}
								schemaName={schemaName}
								databaseId={databaseId}
								disabled={isPending}
								onCreateField={handleOpenFieldCard}
							/>
						)}
					</div>
				</div>
			</ScrollArea>

			<div className='flex justify-end gap-2 border-t px-4 py-3'>
				<Button type='button' variant='outline' onClick={() => card.close()} disabled={isPending}>
					Back
				</Button>
				<Button type='submit' disabled={!isFormValid || isPending}>
					{isPending && <Loader2Icon className='mr-2 h-4 w-4 animate-spin' />}
					{isPending ? 'Creating...' : 'Create Table'}
				</Button>
			</div>
		</form>
	);
};
