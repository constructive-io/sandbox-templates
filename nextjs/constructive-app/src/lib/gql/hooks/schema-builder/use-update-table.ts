/**
 * Hook for updating a table
 * Tier 4 wrapper: adds table re-selection after update
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUpdateTableMutation } from '@sdk/app-public';

import { invalidateDatabaseEntities } from './modules/invalidate-database-entities';
import { useSchemaBuilderSelectors } from './use-schema-builder-selectors';

export interface UpdateTableInput {
	id: string;
	name?: string;
	label?: string | null;
	description?: string | null;
	smartTags?: Record<string, unknown> | null;
}

export interface UpdatedTable {
	id: string;
	name: string;
}

export function useUpdateTable() {
	const queryClient = useQueryClient();
	const { selectTable, selectedTableId, currentDatabase } = useSchemaBuilderSelectors();
	const updateTableMutation = useUpdateTableMutation();

	return useMutation({
		mutationFn: async (input: UpdateTableInput): Promise<UpdatedTable> => {
			const { id, ...patchFields } = input;

			const result = await updateTableMutation.mutateAsync({
				input: {
					id,
					patch: patchFields,
				},
			});

			const table = result.updateTable?.table;
			if (!table?.id || !table?.name) {
				throw new Error('Failed to update table');
			}

			return { id: table.id, name: table.name };
		},
		onSuccess: async (updatedTable) => {
			await invalidateDatabaseEntities(queryClient, currentDatabase?.databaseId);

			// Re-select the updated table and update URL if this was the selected table
			if (updatedTable.id && updatedTable.name && selectedTableId === updatedTable.id) {
				selectTable(updatedTable.id, updatedTable.name);
			}
		},
		onError: (error) => {
			console.error('Failed to update table:', error);
		},
	});
}
