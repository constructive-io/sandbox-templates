/**
 * Hook for creating tables for policies
 * Tier 4 wrapper: uses SDK + business logic (auto-grant) + custom cache invalidation
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCreateTableMutation } from '@sdk/api';
import { useCreateTableGrant } from '../use-table-grants';
import { databasePoliciesQueryKeys } from './use-database-policies';

export interface CreatePolicyTableInput {
	name: string;
	databaseId: string;
	schemaId: string;
}

export function useCreatePolicyTable() {
	const queryClient = useQueryClient();
	const createTableMutation = useCreateTableMutation();
	const { mutateAsync: createGrant } = useCreateTableGrant();

	return useMutation({
		mutationFn: async (input: CreatePolicyTableInput) => {
			const result = await createTableMutation.mutateAsync({
				input: {
					table: {
						name: input.name,
						databaseId: input.databaseId,
						schemaId: input.schemaId,
					},
				},
			});

			const table = result.createTable?.table;
			if (!table?.id || !table?.name) {
				throw new Error('Failed to create table');
			}

			const createdTable = { id: table.id, name: table.name };

			// Auto-grant basic permissions to make table immediately usable
			if (createdTable.name) {
				try {
					await createGrant({
						databaseId: input.databaseId,
						tableName: createdTable.name,
						privileges: ['select', 'insert', 'update', 'delete'],
						roleName: 'authenticated',
					});
				} catch (error) {
					console.warn(
						`Table created successfully but failed to grant permissions: ${error instanceof Error ? error.message : 'Unknown error'}`,
					);
				}
			}

			return createdTable;
		},
		onSuccess: async (_createdTable, variables) => {
			await queryClient.invalidateQueries({
				queryKey: databasePoliciesQueryKeys.byDatabase(variables.databaseId),
			});
		},
	});
}
