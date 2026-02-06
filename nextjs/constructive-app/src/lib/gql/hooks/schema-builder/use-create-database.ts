/**
 * Hook for creating a new database
 * Tier 4 wrapper: Uses SDK hooks + composition
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAppStore, useShallow } from '@/store/app-store';
import {
	fetchSchemasQuery,
	useCreateDatabaseMutation,
} from '@sdk/api';

import { invalidateDatabaseEntities } from './modules/invalidate-database-entities';
import { useSchemaBuilderSelectors } from './use-schema-builder-selectors';

export interface CreateDatabaseResult {
	database: {
		id: string;
		name?: string | null;
	};
	schema: {
		id: string;
		name: string;
	};
}

export function useCreateDatabase() {
	const queryClient = useQueryClient();
	const { selectSchema } = useSchemaBuilderSelectors();
	const createDatabaseMutation = useCreateDatabaseMutation();

	// Get auth state from the auth slice (not schema slice)
	const { user, token } = useAppStore(
		useShallow((state) => ({
			user: state.authByContext['schema-builder']?.user || null,
			token: state.authByContext['schema-builder']?.token || null,
		})),
	);

	return useMutation<CreateDatabaseResult, Error, { name: string; ownerId?: string }>({
		mutationFn: async (data) => {
			// Use provided ownerId (for org-owned databases) or fall back to current user
			const ownerId = data.ownerId || user?.id || token?.userId;
			if (!ownerId) {
				throw new Error('No authenticated user found');
			}

			// Create database - triggers automatically create 'public' and 'private' schemas
			const databaseResult = await createDatabaseMutation.mutateAsync({
				input: {
					database: {
						name: data.name,
						ownerId,
					},
				},
			});

			if (!databaseResult.createDatabase?.database?.id) {
				throw new Error('Failed to create database');
			}

			const databaseId = databaseResult.createDatabase.database.id;
			const databaseName = databaseResult.createDatabase.database.name ?? data.name;

			// Query for schemas (SDK mutation doesn't return nested schemas)
			const schemasResult = await fetchSchemasQuery({
				filter: { databaseId: { equalTo: databaseId } },
				orderBy: ['NAME_ASC'],
			});

			const schemas = schemasResult.schemas?.nodes ?? [];

			// Find the 'public' schema (this is what the seed script does!)
			const publicSchema = schemas.find((s) => s?.name === 'public');

			if (!publicSchema?.id) {
				throw new Error(`No 'public' schema found for database "${databaseName}".`);
			}

			// Return the 'public' schema - this matches what table creation expects!
			return {
				database: {
					id: databaseId,
					name: databaseName,
				},
				schema: {
					id: publicSchema.id,
					name: publicSchema.name ?? 'public',
				},
			};
		},
		onSuccess: async (result) => {
			await invalidateDatabaseEntities(queryClient, result.database.id);

			// Select the newly created database
			const newSchemaKey = `db-${result.database.id}`;
			selectSchema(newSchemaKey);
		},
		onError: (error) => {
			console.error('Failed to create database:', error);
		},
	});
}
