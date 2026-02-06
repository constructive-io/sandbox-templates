/**
 * Hook for deleting a database
 * Tier 4 wrapper: adds cache invalidation and schema selection handling
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useDeleteDatabaseMutation } from '@sdk/api';

import { invalidateDatabaseEntities } from './modules/invalidate-database-entities';
import { useSchemaBuilderSelectors } from './use-schema-builder-selectors';

export interface DeleteDatabaseInput {
	id: string;
}

export function useDeleteDatabase() {
	const queryClient = useQueryClient();
	const { availableSchemas, selectedSchemaKey, selectSchema, selectTable } = useSchemaBuilderSelectors();
	const deleteDatabaseMutation = useDeleteDatabaseMutation();

	return useMutation({
		mutationFn: async (input: DeleteDatabaseInput) => {
			await deleteDatabaseMutation.mutateAsync({ input: { id: input.id } });

			return { id: input.id };
		},
		onSuccess: async (deletedDatabase) => {
			await invalidateDatabaseEntities(queryClient, deletedDatabase.id);

			const deletedDatabaseKey = `db-${deletedDatabase.id}`;
			const isSelectedDatabase = selectedSchemaKey === deletedDatabaseKey;

			if (isSelectedDatabase) {
				// Filter remaining databases after invalidation
				// Note: availableSchemas here is from the hook's closure, so we need to select
				// from what we know. The actual available schemas will update after query invalidation.
				const remainingDatabases = availableSchemas.filter(
					(schema) => schema.source === 'database' && schema.key !== deletedDatabaseKey,
				);

				if (remainingDatabases.length > 0) {
					const deletedIndex = availableSchemas.findIndex((schema) => schema.key === deletedDatabaseKey);
					let newSelectedSchema = remainingDatabases[0];

					if (deletedIndex >= 0 && deletedIndex < remainingDatabases.length) {
						newSelectedSchema = remainingDatabases[deletedIndex];
					} else if (remainingDatabases.length > 0) {
						newSelectedSchema = remainingDatabases[remainingDatabases.length - 1];
					}

					// Select the new schema and its first table
					selectSchema(newSelectedSchema.key);

					const firstTableId = newSelectedSchema.dbSchema?.tables?.[0]?.id;
					if (firstTableId) {
						selectTable(firstTableId);
					}
				} else {
					// No remaining databases - clear selection
					selectSchema('');
				}
			}
		},
		onError: (error) => {
			console.error('Failed to delete database:', error);
		},
	});
}
