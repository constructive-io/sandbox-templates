/**
 * Hook for creating a database with provisioning
 * Tier 4 wrapper: Uses SDK hooks
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAppStore, useShallow } from '@/store/app-store';
import { useCreateDatabaseProvisionModuleMutation } from '@sdk/api';

import { invalidateDatabaseEntities } from './modules/invalidate-database-entities';
import { useSchemaBuilderSelectors } from './use-schema-builder-selectors';

export type DatabaseProvisionStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface DatabaseProvision {
	id: string;
	databaseId: string | null;
	databaseName: string;
	status: DatabaseProvisionStatus;
	errorMessage: string | null;
	modules: string[];
	completedAt: string | null;
}

export interface CreateDatabaseProvisionResult {
	provision: DatabaseProvision;
}

export interface CreateDatabaseProvisionInput {
	name: string;
	/** Base domain for the database (e.g., "example.com") - required */
	domain: string;
	/** Subdomain prefix. If omitted, auto-generated using unique_names + random 3-char prefix */
	subdomain?: string;
	ownerId?: string;
}

/**
 * Hook to create a database with full provisioning (API, domain, modules).
 *
 * This replaces the old flow of:
 * 1. createDatabase
 * 2. launchDatabaseSetupWorkflow (domain, API, extensions, modules)
 *
 * The backend's createDatabaseProvision mutation handles everything in ~10s.
 */
export function useCreateDatabaseProvision() {
	const queryClient = useQueryClient();
	const { selectSchema } = useSchemaBuilderSelectors();
	const createProvisionMutation = useCreateDatabaseProvisionModuleMutation();

	// Get auth state from the auth slice
	const { user, token } = useAppStore(
		useShallow((state) => ({
			user: state.authByContext['schema-builder']?.user || null,
			token: state.authByContext['schema-builder']?.token || null,
		})),
	);

	return useMutation<CreateDatabaseProvisionResult, Error, CreateDatabaseProvisionInput>({
		mutationFn: async (data) => {
			// Use provided ownerId or fall back to current user
			const ownerId = data.ownerId || user?.id || token?.userId;
			if (!ownerId) {
				throw new Error('No authenticated user found');
			}

			// Call the provision mutation - backend handles everything
			const result = await createProvisionMutation.mutateAsync({
				input: {
					databaseProvisionModule: {
						databaseName: data.name,
						domain: data.domain,
						subdomain: data.subdomain || null, // null triggers auto-generation
						ownerId,
						modules: ['all'], // Always install all modules
					},
				},
			});

			const provision = result.createDatabaseProvisionModule?.databaseProvisionModule;

			if (!provision) {
				throw new Error('Failed to create database provision');
			}

			// Check if provisioning failed
			if (provision.status === 'failed') {
				throw new Error(provision.errorMessage || 'Database provisioning failed');
			}

			return {
				provision: {
					id: provision.id ?? '',
					databaseId: provision.databaseId ?? null,
					databaseName: provision.databaseName ?? data.name,
					status: (provision.status ?? 'pending') as DatabaseProvisionStatus,
					errorMessage: provision.errorMessage ?? null,
					modules: (provision.modules ?? []).filter((m): m is string => m !== null),
					completedAt: provision.completedAt ?? null,
				},
			};
		},
		onSuccess: async (result) => {
			// Invalidate all database-related queries
			if (result.provision.databaseId) {
				await invalidateDatabaseEntities(queryClient, result.provision.databaseId);

				// Select the newly created database
				const newSchemaKey = `db-${result.provision.databaseId}`;
				selectSchema(newSchemaKey);
			}

			// Also invalidate the user databases list
			await queryClient.invalidateQueries({
				predicate: (query) => {
					const key = query.queryKey;
					// Invalidate queries that fetch user's databases
					return (
						Array.isArray(key) &&
						(key.includes('databases') || key.includes('userDatabases') || key.includes('schema-builder'))
					);
				},
			});
		},
		onError: (error) => {
			console.error('Failed to provision database:', error);
		},
	});
}
