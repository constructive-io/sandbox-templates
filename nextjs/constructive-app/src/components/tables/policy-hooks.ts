import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
	fetchPoliciesQuery,
	useCreatePolicyMutation,
	useCreateTableModuleMutation,
	useNodeTypeRegistriesQuery,
} from '@sdk/api';
import { invalidateDatabaseEntities } from '@/lib/gql/hooks/schema-builder/modules/invalidate-database-entities';
import {
	useCreatePolicyField,
	type PolicyFieldType,
} from '@/lib/gql/hooks/schema-builder/policies/use-create-policy-field';
import { useCreateTable } from '@/lib/gql/hooks/schema-builder/use-create-table';

import {
	getFieldsRequiringColumns,
	getGeneratedFields,
	getPolicyCategory,
	mergeOperationPolicyData,
	POLICY_TYPE_UI_CONFIG,
} from './policy-config';
import type {
	CreateTableWithPoliciesInput,
	CreateTableWithPolicyInput,
	CreateTableWithPolicyResult,
	CreationStep,
	FieldOverride,
	FormFieldSchema,
	FormFieldType,
	MergedPolicyType,
} from './policy-types';
import { CRUD_OPERATIONS, CRUD_TO_PRIVILEGE } from './policy-types';

// ============================================================================
// POLICY TYPES HOOKS
// ============================================================================

/**
 * Build policy types from UI config only (fallback when backend unavailable)
 */
function buildPolicyTypesFromUIConfig(): MergedPolicyType[] {
	const policyTypes: MergedPolicyType[] = [];

	for (const [name, uiConfig] of Object.entries(POLICY_TYPE_UI_CONFIG)) {
		policyTypes.push({
			name,
			slug: name.toLowerCase(),
			parameterSchema: null,
			tags: [],
			title: uiConfig.title ?? name,
			description: '',
			tagline: uiConfig.tagline,
			icon: uiConfig.icon,
			category: uiConfig.category,
			hasTableModule: uiConfig.hasTableModule,
			tableModuleType: uiConfig.tableModuleType,
			generatedFields: uiConfig.tableModuleType ? getGeneratedFields(uiConfig.tableModuleType) : [],
			fieldOverrides: uiConfig.fieldOverrides,
			advancedFields: uiConfig.advancedFields,
			diagramKey: uiConfig.diagramKey,
			sortOrder: uiConfig.sortOrder,
		});
	}

	return policyTypes.sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Hook to fetch policy types from the backend registry and merge with UI config.
 *
 * Falls back to UI config only if backend returns no data.
 * Results are sorted by sortOrder from the UI config.
 */
export function usePolicyTypes() {
	const {
		data: registryData,
		isLoading,
		error,
	} = useNodeTypeRegistriesQuery(
		{
			filter: { category: { equalTo: 'authz' } },
			first: 100,
		},
		{
			staleTime: 1000 * 60 * 10, // Cache 10 minutes
		},
	);

	const policyTypes = useMemo<MergedPolicyType[]>(() => {
		const registryTypes = registryData?.nodeTypeRegistries?.nodes ?? [];

		// Fallback to UI config only when backend returns no data
		if (registryTypes.length === 0) {
			return buildPolicyTypesFromUIConfig();
		}

		const merged: MergedPolicyType[] = [];

		for (const regType of registryTypes) {
			// Skip types without a name
			if (!regType.name) continue;

			const uiConfig = POLICY_TYPE_UI_CONFIG[regType.name];

			// Skip types not in UI config (gradual rollout)
			if (!uiConfig) continue;

			merged.push({
				// Backend data
				name: regType.name,
				slug: regType.slug ?? regType.name.toLowerCase(),
				parameterSchema: regType.parameterSchema,
				tags: regType.tags,
				// Merged UI config (UI overrides backend)
				title: uiConfig.title ?? regType.displayName ?? regType.name,
				description: regType.description ?? '',
				tagline: uiConfig.tagline,
				icon: uiConfig.icon,
				category: uiConfig.category,
				hasTableModule: uiConfig.hasTableModule,
				tableModuleType: uiConfig.tableModuleType,
				generatedFields: uiConfig.tableModuleType ? getGeneratedFields(uiConfig.tableModuleType) : [],
				fieldOverrides: uiConfig.fieldOverrides,
				advancedFields: uiConfig.advancedFields,
				diagramKey: uiConfig.diagramKey,
				sortOrder: uiConfig.sortOrder,
			});
		}

		// If backend returned data but none matched UI config, fallback to UI config
		if (merged.length === 0) {
			return buildPolicyTypesFromUIConfig();
		}

		// Sort by sortOrder
		return merged.sort((a, b) => a.sortOrder - b.sortOrder);
	}, [registryData]);

	return {
		policyTypes,
		isLoading,
		error,
	};
}

/**
 * Hook to get a single policy type by name
 */
export function usePolicyType(policyTypeName: string | null) {
	const { policyTypes, isLoading, error } = usePolicyTypes();

	const policyType = useMemo(() => {
		if (!policyTypeName) return null;
		return policyTypes.find((pt) => pt.name === policyTypeName) ?? null;
	}, [policyTypes, policyTypeName]);

	return {
		policyType,
		isLoading,
		error,
	};
}

// ============================================================================
// FORM SCHEMA HOOKS
// ============================================================================

/**
 * JSON Schema property definition
 */
interface JsonSchemaProperty {
	type?: string | string[];
	enum?: unknown[];
	default?: unknown;
	description?: string;
	items?: { type?: string };
}

/**
 * JSON Schema definition
 */
interface JsonSchema {
	type?: string;
	properties?: Record<string, JsonSchemaProperty>;
	required?: string[];
}

/**
 * Map JSON Schema type to form field type
 */
function inferFieldType(key: string, property: JsonSchemaProperty): FormFieldType {
	// Special cases based on key name patterns
	if (key === 'membership_type') {
		return 'membership-type-select';
	}
	if (key === 'permission') {
		return 'permission-select';
	}
	if (key.endsWith('_table') || key === 'obj_table' || key === 'owned_table') {
		return 'table-select';
	}
	if (key.endsWith('_field') || key.endsWith('_fields') || key === 'entity_field') {
		return property.type === 'array' ? 'field-multi-select' : 'field-select';
	}

	// Infer from JSON Schema type
	const type = Array.isArray(property.type) ? property.type[0] : property.type;

	switch (type) {
		case 'boolean':
			return 'boolean';
		case 'integer':
		case 'number':
			return 'number';
		case 'array':
			// Array of strings likely means multi-select
			if (property.items?.type === 'string') {
				return 'field-multi-select';
			}
			return 'text';
		case 'string':
		default:
			return 'text';
	}
}

/**
 * Convert JSON Schema parameterSchema to form fields
 */
function jsonSchemaToFormFields(schema: unknown, overrides?: Record<string, FieldOverride>): FormFieldSchema[] {
	if (!schema || typeof schema !== 'object') {
		// Fallback: generate fields from overrides only
		return fieldOverridesToFormFields(overrides);
	}

	const jsonSchema = schema as JsonSchema;
	const properties = jsonSchema.properties;
	if (!properties) {
		// Fallback: generate fields from overrides only
		return fieldOverridesToFormFields(overrides);
	}

	const requiredFields = new Set(jsonSchema.required ?? []);
	const fields: FormFieldSchema[] = [];

	for (const [key, property] of Object.entries(properties)) {
		const override = overrides?.[key];

		// Skip hidden fields from form display
		if (override?.hidden) continue;

		const fieldType = inferFieldType(key, property);

		fields.push({
			key,
			type: fieldType,
			label: override?.label ?? formatKeyAsLabel(key),
			description: override?.description ?? property.description,
			placeholder: override?.placeholder,
			required: requiredFields.has(key),
			defaultValue: override?.defaultValue ?? property.default,
		});
	}

	return fields;
}

/**
 * Generate form fields from fieldOverrides config (fallback when no parameterSchema)
 */
function fieldOverridesToFormFields(overrides?: Record<string, FieldOverride>): FormFieldSchema[] {
	if (!overrides) return [];

	const fields: FormFieldSchema[] = [];

	for (const [key, override] of Object.entries(overrides)) {
		// Skip hidden fields from form display
		if (override.hidden) continue;

		// Infer type from key name patterns
		let fieldType: FormFieldType = 'text';
		if (key === 'membership_type') {
			fieldType = 'membership-type-select';
		} else if (key === 'permission') {
			fieldType = 'permission-select';
		} else if (key.endsWith('_table') || key === 'obj_table' || key === 'owned_table') {
			fieldType = 'table-select';
		} else if (key === 'entity_fields') {
			fieldType = 'field-multi-select';
		} else if (key.endsWith('_field') || key === 'entity_field') {
			fieldType = 'field-select';
		} else if (key === 'is_admin' || key === 'is_owner') {
			fieldType = 'boolean';
		}

		fields.push({
			key,
			type: fieldType,
			label: override.label ?? formatKeyAsLabel(key),
			description: override.description,
			placeholder: override.placeholder,
			required: false,
			defaultValue: override.defaultValue,
		});
	}

	return fields;
}

/**
 * Format a snake_case key as a human-readable label
 */
function formatKeyAsLabel(key: string): string {
	return key
		.split('_')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

/**
 * Hook to convert a policy type's parameterSchema to form fields
 *
 * Returns:
 * - mainFields: Fields shown in the main form area
 * - advancedFields: Fields shown in the collapsible advanced section
 */
export function useFormSchema(policyType: MergedPolicyType | null) {
	return useMemo(() => {
		if (!policyType) {
			return {
				mainFields: [],
				advancedFields: [],
				allFields: [],
			};
		}

		const allFields = jsonSchemaToFormFields(policyType.parameterSchema, policyType.fieldOverrides);

		// Split into main and advanced
		const advancedKeys = new Set(policyType.advancedFields ?? []);

		const mainFields = allFields.filter((f) => !advancedKeys.has(f.key));
		const advancedFields = allFields.filter((f) => advancedKeys.has(f.key));

		return {
			mainFields,
			advancedFields,
			allFields,
		};
	}, [policyType]);
}

/**
 * Get default values for all fields in a policy type
 */
export function getDefaultFormValues(policyType: MergedPolicyType | null): Record<string, unknown> {
	if (!policyType) return {};

	const fields = jsonSchemaToFormFields(policyType.parameterSchema, policyType.fieldOverrides);
	const defaults: Record<string, unknown> = {};

	for (const field of fields) {
		if (field.defaultValue !== undefined) {
			defaults[field.key] = field.defaultValue;
		}
	}

	return defaults;
}

// ============================================================================
// TABLE WITH POLICY CREATION HOOK
// ============================================================================

/**
 * Hook to create a table with an associated policy and optional table module.
 *
 * Creation flow:
 * 1. Create table (with auto-grant via existing useCreateTable)
 * 2. Create table module if hasTableModule (auto-generates fields like owner_id)
 * 3. Create ONE policy with specified settings
 */
export function useCreateTableWithPolicy() {
	const queryClient = useQueryClient();
	const [currentStep, setCurrentStep] = useState<CreationStep>('idle');
	const [stepLabel, setStepLabel] = useState<string>('');

	const createTable = useCreateTable();
	const createTableModule = useCreateTableModuleMutation();
	const createPolicy = useCreatePolicyMutation();

	const mutation = useMutation({
		mutationFn: async (input: CreateTableWithPolicyInput): Promise<CreateTableWithPolicyResult> => {
			const {
				databaseId,
				schemaId,
				privateSchemaId,
				tableName,
				policyType,
				policyName,
				policyData,
				tableModuleType,
				tableModuleData = {},
				privilege,
				roleName,
				isPermissive,
				isEnabled,
			} = input;

			// Step 1: Create table
			setCurrentStep('creating-table');
			setStepLabel(`Creating table ${tableName}...`);

			const tableResult = await createTable.mutateAsync({
				name: tableName,
				schemaId,
				databaseId,
				useRls: true, // Enable RLS for policy-protected tables
			});

			const tableId = tableResult.id;

			// Step 2: Create table module (if needed)
			let tableModuleId: string | undefined;
			if (tableModuleType) {
				setCurrentStep('creating-table-module');
				setStepLabel(`Creating ${tableModuleType} module...`);

				const moduleResult = await createTableModule.mutateAsync({
					input: {
						tableModule: {
							databaseId,
							privateSchemaId,
							tableId,
							nodeType: tableModuleType,
							data: tableModuleData,
						},
					},
				});

				tableModuleId = moduleResult.createTableModule?.tableModule?.id ?? undefined;
			}

			// Step 3: Create single policy
			setCurrentStep('creating-policies');
			setStepLabel(`Creating ${privilege} policy...`);
			const policyIds: string[] = [];

			const policyResult = await createPolicy.mutateAsync({
				input: {
					policy: {
						databaseId,
						tableId,
						name: policyName,
						roleName,
						privilege,
						permissive: isPermissive,
						disabled: !isEnabled,
						policyType,
						data: policyData,
					},
				},
			});

			const policyId = policyResult.createPolicy?.policy?.id;
			if (policyId) {
				policyIds.push(policyId);
			}

			setCurrentStep('done');
			setStepLabel('');

			return {
				tableId,
				tableName,
				tableModuleId,
				policyIds,
			};
		},
		onSuccess: async (_, variables) => {
			await invalidateDatabaseEntities(queryClient, variables.databaseId);
		},
		onError: (error) => {
			setCurrentStep('error');
			setStepLabel(error instanceof Error ? error.message : 'Unknown error');
			console.error('Failed to create table with policy:', error);
		},
	});

	const reset = () => {
		setCurrentStep('idle');
		setStepLabel('');
		mutation.reset();
	};

	return {
		createTableWithPolicy: mutation.mutateAsync,
		isCreating: mutation.isPending,
		error: mutation.error,
		currentStep,
		stepLabel,
		reset,
	};
}

// ============================================================================
// POLICY NAME GENERATION HELPERS
// ============================================================================

/**
 * Check if a policy name conflicts with existing names.
 * The backend may prefix policy names (e.g., auth_upd_{name}), so we check both:
 * 1. Exact match
 * 2. Existing name ends with _{baseName} (backend-prefixed version)
 */
function hasNameConflict(baseName: string, existingNames: Set<string>): boolean {
	if (existingNames.has(baseName)) return true;

	// Check if any existing name ends with the base name (handles backend prefix like auth_upd_)
	for (const existing of existingNames) {
		if (existing.endsWith(`_${baseName}`) || existing === baseName) {
			return true;
		}
	}
	return false;
}

/**
 * Generate a unique policy name by checking existing names and incrementing if needed.
 * e.g., posts_select -> posts_select_2 -> posts_select_3
 * Handles backend-prefixed names (e.g., auth_upd_posts_select)
 */
function generateUniquePolicyName(baseName: string, existingNames: Set<string>): string {
	if (!hasNameConflict(baseName, existingNames)) {
		return baseName;
	}

	let counter = 2;
	let candidateName = `${baseName}_${counter}`;
	while (hasNameConflict(candidateName, existingNames)) {
		counter++;
		candidateName = `${baseName}_${counter}`;
	}
	return candidateName;
}

// ============================================================================
// TABLE WITH 4 CRUD POLICIES CREATION HOOK
// ============================================================================

/**
 * Hook to create a table with 4 CRUD policies (SELECT, INSERT, UPDATE, DELETE).
 *
 * Creation flow:
 * 1. Create table (with auto-grant via existing useCreateTable)
 * 2. Create table module if hasTableModule (auto-generates fields like owner_id)
 * 3. Create 4 policies, one for each CRUD operation
 */
export function useCreateTableWithPolicies() {
	const queryClient = useQueryClient();
	const [currentStep, setCurrentStep] = useState<CreationStep>('idle');
	const [stepLabel, setStepLabel] = useState<string>('');

	const createTable = useCreateTable();
	const createTableModule = useCreateTableModuleMutation();
	const createPolicy = useCreatePolicyMutation();
	const createField = useCreatePolicyField();

	const mutation = useMutation({
		mutationFn: async (input: CreateTableWithPoliciesInput): Promise<CreateTableWithPolicyResult> => {
			const {
				databaseId,
				schemaId,
				privateSchemaId,
				tableId: existingTableId,
				tableName,
				policyType,
				tableModuleType,
				tableModuleData = {},
				sharedPolicyData,
				operations,
				enabledOperations = CRUD_OPERATIONS,
				fieldNameOverrides = {},
			} = input;

			// Determine policy category
			const category = getPolicyCategory(policyType);

			let tableId: string;

			// Step 1: Create table (skip if tableId already provided)
			if (existingTableId) {
				tableId = existingTableId;
			} else {
				setCurrentStep('creating-table');
				setStepLabel(`Creating table ${tableName}...`);

				const tableResult = await createTable.mutateAsync({
					name: tableName,
					schemaId,
					databaseId,
					useRls: true, // Enable RLS for policy-protected tables
				});

				tableId = tableResult.id;
			}

			// Step 2: Create table module (for 'has-module' category policies)
			let tableModuleId: string | undefined;
			if (category === 'has-module' && tableModuleType) {
				setCurrentStep('creating-table-module');
				setStepLabel(`Creating ${tableModuleType} module...`);

				const moduleResult = await createTableModule.mutateAsync({
					input: {
						tableModule: {
							databaseId,
							privateSchemaId,
							tableId,
							nodeType: tableModuleType,
							data: tableModuleData,
						},
					},
				});

				tableModuleId = moduleResult.createTableModule?.tableModule?.id ?? undefined;
			}

			// Step 2.5: Create fields sequentially (for 'needs-fields' category policies)
			// Serialized to avoid PostgreSQL "tuple concurrently updated" errors —
			// each ALTER TABLE ADD COLUMN modifies the same pg_class catalog row.
			const createdFieldNames: Record<string, string> = {};

			if (category === 'needs-fields') {
				setCurrentStep('creating-fields');
				const fieldsToCreate = getFieldsRequiringColumns(policyType);
				setStepLabel('Creating fields...');

				for (const fieldConfig of fieldsToCreate) {
					const fieldName = fieldNameOverrides[fieldConfig.key] || fieldConfig.defaultName;
					await createField.mutateAsync({
						name: fieldName,
						tableId,
						databaseId,
						fieldType: fieldConfig.pgType as PolicyFieldType,
					});
					createdFieldNames[fieldConfig.key] = fieldName;
				}
			}

			// Step 3: Create policies for enabled operations sequentially
			// Serialized to avoid PostgreSQL "tuple concurrently updated" errors —
			// each CREATE POLICY modifies the same table's catalog entry.
			setCurrentStep('creating-policies');
			setStepLabel('Creating policies...');

			// Build base policy data, injecting created field names for 'needs-fields' category
			const basePolicyData =
				category === 'needs-fields' ? { ...sharedPolicyData, ...createdFieldNames } : sharedPolicyData;

			// Fetch existing policies for this table to avoid name conflicts
			const existingPoliciesResult = await fetchPoliciesQuery({
				filter: { tableId: { equalTo: tableId } },
			});
			const existingPolicyNames = new Set(
				(existingPoliciesResult.policies?.nodes ?? [])
					.map((p) => p.name)
					.filter((name): name is string => name != null),
			);

			// Pre-generate all unique policy names
			const policyNames = new Map<string, string>();
			const usedNames = new Set(existingPolicyNames);
			for (const op of enabledOperations) {
				const baseName = `${tableName}_${op}`;
				const uniqueName = generateUniquePolicyName(baseName, usedNames);
				policyNames.set(op, uniqueName);
				usedNames.add(uniqueName);
			}

			const policyIds: string[] = [];
			for (const op of enabledOperations) {
				const config = operations[op];
				const privilege = CRUD_TO_PRIVILEGE[op];
				const policyName = policyNames.get(op)!;

				const finalPolicyData = mergeOperationPolicyData(policyType, basePolicyData, config.policyData);

				const result = await createPolicy.mutateAsync({
					input: {
						policy: {
							databaseId,
							tableId,
							name: policyName,
							roleName: config.roleName,
							privilege,
							permissive: config.isPermissive,
							disabled: false,
							policyType,
							data: finalPolicyData,
						},
					},
				});

				const policyId = result.createPolicy?.policy?.id;
				if (policyId) {
					policyIds.push(policyId);
				}
			}

			setCurrentStep('done');
			setStepLabel('');

			return {
				tableId,
				tableName,
				tableModuleId,
				policyIds,
			};
		},
		onSuccess: async (_, variables) => {
			await invalidateDatabaseEntities(queryClient, variables.databaseId);
		},
		onError: (error) => {
			setCurrentStep('error');
			setStepLabel(error instanceof Error ? error.message : 'Unknown error');
			console.error('Failed to create table with policies:', error);
		},
	});

	const reset = () => {
		setCurrentStep('idle');
		setStepLabel('');
		mutation.reset();
	};

	return {
		createTableWithPolicies: mutation.mutateAsync,
		isCreating: mutation.isPending,
		error: mutation.error,
		currentStep,
		stepLabel,
		reset,
	};
}
