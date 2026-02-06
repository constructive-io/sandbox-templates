/**
 * Hook for creating fields for policies
 * Tier 4 wrapper: uses SDK + transform + custom cache invalidation
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCreateFieldMutation } from '@sdk/api';
import { databasePoliciesQueryKeys } from './use-database-policies';

export type PolicyFieldType = 'uuid' | 'uuid[]' | 'timestamptz' | 'boolean';

export interface CreatePolicyFieldInput {
	name: string;
	tableId: string;
	databaseId: string;
	fieldType: PolicyFieldType;
}

export function useCreatePolicyField() {
	const queryClient = useQueryClient();
	const createFieldMutation = useCreateFieldMutation();

	return useMutation({
		mutationFn: async (input: CreatePolicyFieldInput) => {
			const result = await createFieldMutation.mutateAsync({
				input: {
					field: {
						name: input.name,
						tableId: input.tableId,
						databaseId: input.databaseId,
						type: input.fieldType,
						isRequired: false,
					},
				},
			});

			const createdField = result.createField?.field;
			if (!createdField?.id) {
				throw new Error('Failed to create field');
			}

			return { id: createdField.id, name: createdField.name ?? '', type: createdField.type ?? '' };
		},
		onSuccess: async (_createdField, variables) => {
			await queryClient.invalidateQueries({
				queryKey: databasePoliciesQueryKeys.byDatabase(variables.databaseId),
			});
		},
	});
}
