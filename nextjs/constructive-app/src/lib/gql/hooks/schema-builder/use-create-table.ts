/**
 * Hook for creating a table
 * Tier 4 wrapper: adds auto-grant permissions and table selection
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCreateTableMutation } from '@sdk/api';

import { invalidateDatabaseEntities } from './modules/invalidate-database-entities';
import { useSchemaBuilderSelectors } from './use-schema-builder-selectors';
import { useCreateTableGrant } from './use-table-grants';

export interface CreateTableData {
	name: string;
	schemaId: string;
	databaseId: string;
	description?: string | null;
	label?: string | null;
	smartTags?: Record<string, unknown> | null;
	useRls?: boolean | null;
}

// Return type with non-nullable id for consumer safety
export interface CreatedTable {
	id: string;
	name: string;
	databaseId: string | null;
	schemaId: string | null;
	label: string | null;
	description: string | null;
}

export function useCreateTable() {
	const queryClient = useQueryClient();
	const { selectTable } = useSchemaBuilderSelectors();
	const { mutateAsync: createGrant } = useCreateTableGrant();
	const createTableMutation = useCreateTableMutation();

	return useMutation({
		mutationFn: async (input: CreateTableData): Promise<CreatedTable> => {
			// Step 1: Create the table using SDK
			const result = await createTableMutation.mutateAsync({
				input: {
					table: {
						name: input.name,
						schemaId: input.schemaId,
						databaseId: input.databaseId,
						description: input.description,
						label: input.label,
						smartTags: input.smartTags,
						useRls: input.useRls,
					},
				},
			});

			const table = result.createTable?.table;
			if (!table?.id || !table?.name) {
				throw new Error('Failed to create table');
			}

			// Step 2: Auto-grant basic permissions to make table immediately usable
			// Default strategy: Grant all CRUD operations to authenticated users (no RLS)
			// This ensures the table is accessible via the application GraphQL endpoint
			if (input.databaseId && table.name) {
				try {
					await createGrant({
						databaseId: input.databaseId,
						tableName: table.name,
						privileges: ['select', 'insert', 'update', 'delete'],
						roleName: 'authenticated',
					});
				} catch (error) {
					// Log warning but don't fail table creation
					console.warn(
						`⚠️ Table created successfully but failed to grant permissions: ${error instanceof Error ? error.message : 'Unknown error'}`,
					);
					console.warn(`You may need to manually grant permissions for table: ${table.name}`);
				}
			}

			// Return with guaranteed non-null id/name after validation
			return {
				id: table.id,
				name: table.name,
				databaseId: table.databaseId,
				schemaId: table.schemaId,
				label: table.label,
				description: table.description,
			};
		},
		onSuccess: async (createdTable, variables) => {
			await invalidateDatabaseEntities(queryClient, variables?.databaseId);

			if (createdTable?.id && createdTable?.name) {
				selectTable(createdTable.id, createdTable.name);
			}
		},
		onError: (error) => {
			console.error(error);
		},
	});
}
