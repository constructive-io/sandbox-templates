/**
 * Hook for updating a database
 * Tier 4 wrapper: adds cache invalidation
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUpdateDatabaseMutation } from '@sdk/api';

import { invalidateDatabaseEntities } from './modules/invalidate-database-entities';

export interface UpdateDatabaseData {
	id: string;
	name?: string;
	label?: string | null;
}

export function useUpdateDatabase() {
	const queryClient = useQueryClient();
	const updateDatabaseMutation = useUpdateDatabaseMutation();

	return useMutation({
		mutationFn: async (data: UpdateDatabaseData) => {
			const patch: Record<string, unknown> = {};
			if (data.name !== undefined) patch.name = data.name;
			if (data.label !== undefined) patch.label = data.label;

			const result = await updateDatabaseMutation.mutateAsync({ input: { id: data.id, patch } });

			const database = result.updateDatabase?.database;
			if (!database?.id) {
				throw new Error('Failed to update database');
			}

			return database;
		},
		onSuccess: async (_result, variables: UpdateDatabaseData) => {
			await invalidateDatabaseEntities(queryClient, variables.id);
		},
		onError: (error) => {
			console.error('Failed to update database:', error);
		},
	});
}
