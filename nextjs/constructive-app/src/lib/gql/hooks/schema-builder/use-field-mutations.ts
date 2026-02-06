/**
 * Hook for field mutations (create, update, delete)
 * Tier 4 wrapper: orchestrates field + constraint mutations
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { cellTypeToBackendType, mapConstraintsToFieldPatch } from '@/lib/gql/schema-builder/field-constraints-mapper';
import type { FieldDefinition } from '@/lib/schema';

// SDK hooks for field mutations
import {
	useCreateFieldMutation,
	useCreatePrimaryKeyConstraintMutation,
	useCreateUniqueConstraintMutation,
	useDeleteFieldMutation,
	useDeletePrimaryKeyConstraintMutation,
	useDeleteUniqueConstraintMutation,
	useUpdateFieldMutation,
	useUpdatePrimaryKeyConstraintMutation,
} from '@sdk/api';

// SDK hooks for constraint mutations

import { invalidateDatabaseEntities } from './modules/invalidate-database-entities';
import { useSchemaBuilderSelectors } from './use-schema-builder-selectors';

// Input types for hook consumers
export interface CreateFieldData {
	field: FieldDefinition;
	tableId: string;
	databaseId: string;
	tableName: string;
	existingPrimaryKeyConstraintId?: string;
	allPrimaryKeyFieldIds?: string[];
}

export interface UpdateFieldData {
	id: string;
	field: FieldDefinition;
	tableId: string;
	databaseId: string;
	tableName: string;
	existingPrimaryKeyConstraintId?: string;
	existingUniqueConstraintId?: string;
	allPrimaryKeyFieldIds?: string[];
	wasPartOfPrimaryKey?: boolean;
}

export interface DeleteFieldData {
	id: string;
	primaryKeyConstraintId?: string;
	uniqueConstraintId?: string;
	allPrimaryKeyFieldIds?: string[];
	wasPartOfPrimaryKey?: boolean;
}

export interface FieldOrderUpdate {
	id: string;
	fieldOrder: number;
}

// Return type for created field
interface CreatedField {
	id: string;
	name: string;
	type: string;
}

function fieldDefinitionToCreateInput(field: FieldDefinition, tableId: string, databaseId: string) {
	// CRITICAL: Auto-set UUID default value for primary keys to prevent "permission denied" errors
	let defaultValue = field.constraints.defaultValue?.toString() || null;

	const backendType = cellTypeToBackendType(field.type);
	if (backendType === 'uuid' && field.constraints.primaryKey && !defaultValue) {
		defaultValue = 'uuid_generate_v4()';
		console.log(`🔧 Auto-set UUID default for primary key field: ${field.name}`);
	}

	return {
		name: field.name,
		type: backendType,
		tableId,
		databaseId,
		description: field.description || null,
		label: field.label || null,
		defaultValue,
		isRequired: field.isRequired ?? !field.constraints.nullable,
		isHidden: field.isHidden ?? false,
		fieldOrder: field.fieldOrder,
		...mapConstraintsToFieldPatch(field),
	};
}

function fieldDefinitionToPatch(field: FieldDefinition) {
	let defaultValue = field.constraints.defaultValue?.toString() || null;

	const backendType = cellTypeToBackendType(field.type);
	if (backendType === 'uuid' && field.constraints.primaryKey && !defaultValue) {
		defaultValue = 'uuid_generate_v4()';
		console.log(`🔧 Auto-set UUID default for primary key field: ${field.name}`);
	}

	return {
		name: field.name,
		type: backendType,
		description: field.description || null,
		label: field.label || null,
		defaultValue,
		isRequired: field.isRequired ?? !field.constraints.nullable,
		isHidden: field.isHidden ?? false,
		fieldOrder: field.fieldOrder,
		...mapConstraintsToFieldPatch(field),
	};
}

export function useCreateField() {
	const queryClient = useQueryClient();
	const { selectTable, selectedTableId, currentDatabase } = useSchemaBuilderSelectors();
	const createFieldMutation = useCreateFieldMutation();
	const createPkMutation = useCreatePrimaryKeyConstraintMutation();
	const updatePkMutation = useUpdatePrimaryKeyConstraintMutation();
	const createUniqueMutation = useCreateUniqueConstraintMutation();

	return useMutation({
		mutationFn: async (input: CreateFieldData): Promise<CreatedField> => {
			const fieldInput = fieldDefinitionToCreateInput(input.field, input.tableId, input.databaseId);

			// Step 1: Create the field
			const result = await createFieldMutation.mutateAsync({ input: { field: fieldInput } });

			const createdField = result.createField?.field;
			if (!createdField?.id || !createdField?.name) {
				throw new Error('Failed to create field');
			}

			const errors: string[] = [];

			// Step 2: Handle primary key constraint
			if (input.field.constraints.primaryKey) {
				if (input.existingPrimaryKeyConstraintId && input.allPrimaryKeyFieldIds) {
					const updatedFieldIds = [...input.allPrimaryKeyFieldIds, createdField.id];
					try {
						await updatePkMutation.mutateAsync({
							input: { id: input.existingPrimaryKeyConstraintId, patch: { fieldIds: updatedFieldIds } },
						});
					} catch (error) {
						errors.push(`Failed to update primary key constraint: ${error instanceof Error ? error.message : 'Unknown error'}`);
						throw new Error(errors.join('; '));
					}
				} else {
					try {
						await createPkMutation.mutateAsync({
							input: {
								primaryKeyConstraint: {
									tableId: input.tableId,
									databaseId: input.databaseId,
									fieldIds: [createdField.id],
									name: `${input.tableName}_pkey`,
									type: 'p',
								},
							},
						});
					} catch (error) {
						errors.push(`Failed to create primary key constraint: ${error instanceof Error ? error.message : 'Unknown error'}`);
						throw new Error(errors.join('; '));
					}
				}
			}

			// Step 3: Create unique constraint if needed
			if (input.field.constraints.unique) {
				try {
					await createUniqueMutation.mutateAsync({
						input: {
							uniqueConstraint: {
								tableId: input.tableId,
								databaseId: input.databaseId,
								fieldIds: [createdField.id],
								name: `${input.field.name}_key`,
								type: 'u',
							},
						},
					});
				} catch (error) {
					errors.push(`Failed to create unique constraint: ${error instanceof Error ? error.message : 'Unknown error'}`);
					throw new Error(errors.join('; '));
				}
			}

			return { id: createdField.id, name: createdField.name, type: createdField.type ?? '' };
		},
		onSuccess: async (_result, variables) => {
			await invalidateDatabaseEntities(queryClient, variables.databaseId ?? currentDatabase?.databaseId);
			if (selectedTableId) {
				selectTable(selectedTableId);
			}
		},
		onError: (error) => {
			console.error('Failed to create field:', error);
		},
	});
}

export function useUpdateField() {
	const queryClient = useQueryClient();
	const { selectTable, selectedTableId, currentDatabase } = useSchemaBuilderSelectors();
	const updateFieldMutation = useUpdateFieldMutation();
	const createPkMutation = useCreatePrimaryKeyConstraintMutation();
	const updatePkMutation = useUpdatePrimaryKeyConstraintMutation();
	const deletePkMutation = useDeletePrimaryKeyConstraintMutation();
	const createUniqueMutation = useCreateUniqueConstraintMutation();
	const deleteUniqueMutation = useDeleteUniqueConstraintMutation();

	return useMutation({
		mutationFn: async (input: UpdateFieldData) => {
			const patch = fieldDefinitionToPatch(input.field);
			const errors: string[] = [];

			// Step 1: Update the field
			const result = await updateFieldMutation.mutateAsync({ input: { id: input.id, patch } });

			const updatedField = result.updateField?.field;
			if (!updatedField?.id) {
				throw new Error('Failed to update field');
			}

			// Step 2: Handle primary key constraint changes
			const hasPrimaryKey = input.field.constraints.primaryKey;
			const hadPrimaryKey = input.wasPartOfPrimaryKey || false;

			if (hasPrimaryKey && !hadPrimaryKey) {
				if (input.existingPrimaryKeyConstraintId && input.allPrimaryKeyFieldIds) {
					const updatedFieldIds = [...input.allPrimaryKeyFieldIds, input.id];
					try {
						await updatePkMutation.mutateAsync({
							input: { id: input.existingPrimaryKeyConstraintId, patch: { fieldIds: updatedFieldIds } },
						});
					} catch (error) {
						errors.push(`Failed to update primary key constraint: ${error instanceof Error ? error.message : 'Unknown error'}`);
					}
				} else {
					try {
						await createPkMutation.mutateAsync({
							input: {
								primaryKeyConstraint: {
									tableId: input.tableId,
									databaseId: input.databaseId,
									fieldIds: [input.id],
									name: `${input.tableName}_pkey`,
									type: 'p',
								},
							},
						});
					} catch (error) {
						errors.push(`Failed to create primary key constraint: ${error instanceof Error ? error.message : 'Unknown error'}`);
					}
				}
			} else if (!hasPrimaryKey && hadPrimaryKey) {
				if (input.existingPrimaryKeyConstraintId && input.allPrimaryKeyFieldIds) {
					const remainingFieldIds = input.allPrimaryKeyFieldIds.filter((id) => id !== input.id);
					if (remainingFieldIds.length > 0) {
						try {
							await updatePkMutation.mutateAsync({
								input: { id: input.existingPrimaryKeyConstraintId, patch: { fieldIds: remainingFieldIds } },
							});
						} catch (error) {
							errors.push(`Failed to update primary key constraint: ${error instanceof Error ? error.message : 'Unknown error'}`);
						}
					} else {
						try {
							await deletePkMutation.mutateAsync({ input: { id: input.existingPrimaryKeyConstraintId } });
						} catch (error) {
							errors.push(`Failed to delete primary key constraint: ${error instanceof Error ? error.message : 'Unknown error'}`);
						}
					}
				}
			}

			// Step 3: Handle unique constraint changes
			const hasUnique = input.field.constraints.unique;
			const hadUnique = !!input.existingUniqueConstraintId;

			if (hasUnique && !hadUnique) {
				try {
					await createUniqueMutation.mutateAsync({
						input: {
							uniqueConstraint: {
								tableId: input.tableId,
								databaseId: input.databaseId,
								fieldIds: [input.id],
								name: `${input.tableName}_${input.field.name}_key`,
								type: 'u',
							},
						},
					});
				} catch (error) {
					errors.push(`Failed to create unique constraint: ${error instanceof Error ? error.message : 'Unknown error'}`);
				}
			} else if (!hasUnique && hadUnique && input.existingUniqueConstraintId) {
				try {
					await deleteUniqueMutation.mutateAsync({ input: { id: input.existingUniqueConstraintId } });
				} catch (error) {
					errors.push(`Failed to delete unique constraint: ${error instanceof Error ? error.message : 'Unknown error'}`);
				}
			}

			if (errors.length > 0) {
				console.warn('Field updated with constraint errors:', errors.join('; '));
			}

			return updatedField;
		},
		onSuccess: async (_result, variables) => {
			await invalidateDatabaseEntities(queryClient, variables.databaseId ?? currentDatabase?.databaseId);
			if (selectedTableId) {
				selectTable(selectedTableId);
			}
		},
		onError: (error) => {
			console.error('Failed to update field:', error);
		},
	});
}

export function useDeleteField() {
	const queryClient = useQueryClient();
	const { selectTable, selectedTableId, currentDatabase } = useSchemaBuilderSelectors();
	const deleteFieldMutation = useDeleteFieldMutation();
	const updatePkMutation = useUpdatePrimaryKeyConstraintMutation();
	const deletePkMutation = useDeletePrimaryKeyConstraintMutation();
	const deleteUniqueMutation = useDeleteUniqueConstraintMutation();

	return useMutation({
		mutationFn: async (input: DeleteFieldData): Promise<string> => {
			// Step 1: Handle primary key constraint
			if (input.wasPartOfPrimaryKey && input.primaryKeyConstraintId) {
				if (input.allPrimaryKeyFieldIds && input.allPrimaryKeyFieldIds.length > 1) {
					const remainingFieldIds = input.allPrimaryKeyFieldIds.filter((id) => id !== input.id);
					await updatePkMutation.mutateAsync({
						input: { id: input.primaryKeyConstraintId, patch: { fieldIds: remainingFieldIds } },
					});
				} else {
					await deletePkMutation.mutateAsync({ input: { id: input.primaryKeyConstraintId } });
				}
			}

			// Step 2: Handle unique constraint
			if (input.uniqueConstraintId) {
				await deleteUniqueMutation.mutateAsync({ input: { id: input.uniqueConstraintId } });
			}

			// Step 3: Delete the field
			await deleteFieldMutation.mutateAsync({ input: { id: input.id } });

			return input.id;
		},
		onSuccess: async () => {
			await invalidateDatabaseEntities(queryClient, currentDatabase?.databaseId);
			if (selectedTableId) {
				selectTable(selectedTableId);
			}
		},
		onError: (error) => {
			console.error('Failed to delete field:', error);
		},
	});
}

export function useUpdateFieldOrder() {
	const queryClient = useQueryClient();
	const { selectTable, selectedTableId, currentDatabase } = useSchemaBuilderSelectors();
	const updateFieldMutation = useUpdateFieldMutation();

	return useMutation({
		mutationFn: async (fieldUpdates: FieldOrderUpdate[]) => {
			const updatePromises = fieldUpdates.map((update) =>
				updateFieldMutation.mutateAsync({
					input: { id: update.id, patch: { fieldOrder: update.fieldOrder } },
				}),
			);

			await Promise.all(updatePromises);
			return fieldUpdates;
		},
		onSuccess: async () => {
			await invalidateDatabaseEntities(queryClient, currentDatabase?.databaseId);
			if (selectedTableId) {
				selectTable(selectedTableId);
			}
		},
		onError: (error) => {
			console.error('Failed to update field order:', error);
		},
	});
}
