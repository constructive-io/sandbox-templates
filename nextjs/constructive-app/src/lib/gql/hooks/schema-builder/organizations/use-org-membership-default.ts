/**
 * Hooks for managing organization membership defaults
 * Tier 4 wrapper: Uses SDK hooks + cache invalidation
 */
import { useQueryClient } from '@tanstack/react-query';

import type { SchemaContext } from '@/app-config';
import {
	orgMembershipDefaultByEntityIdQueryKey,
	useCreateOrgMembershipDefaultMutation,
	useOrgMembershipDefaultByEntityIdQuery,
	useUpdateOrgMembershipDefaultByEntityIdMutation,
} from '@sdk/admin';
import { useAppStore, useShallow } from '@/store/app-store';

export interface OrgMembershipDefault {
	id: string;
	entityId: string;
	isApproved: boolean;
}

/** @deprecated Use orgMembershipDefaultByEntityIdQueryKey from SDK instead */
export const orgMembershipDefaultQueryKeys = {
	all: ['org-membership-default'] as const,
	byContext: (context: SchemaContext) => [...orgMembershipDefaultQueryKeys.all, { context }] as const,
	byOrg: (context: SchemaContext, orgId: string) =>
		[...orgMembershipDefaultQueryKeys.byContext(context), { orgId }] as const,
};

export interface UseOrgMembershipDefaultOptions {
	orgId: string;
	enabled?: boolean;
	context?: SchemaContext;
}

export function useOrgMembershipDefault(options: UseOrgMembershipDefaultOptions) {
	const { orgId, enabled = true, context = 'schema-builder' } = options;

	const { isAuthenticated } = useAppStore(
		useShallow((state) => ({
			isAuthenticated: state.authByContext[context]?.isAuthenticated || false,
		})),
	);

	const { data, isLoading, error, refetch } = useOrgMembershipDefaultByEntityIdQuery(
		{ entityId: orgId },
		{
			enabled: enabled && isAuthenticated && !!orgId,
			staleTime: 30 * 1000,
			refetchOnMount: 'always',
		},
	);

	const node = data?.orgMembershipDefaultByEntityId;
	const membershipDefault: OrgMembershipDefault | null = node?.id
		? {
				id: node.id,
				entityId: node.entityId ?? orgId,
				isApproved: node.isApproved ?? false,
			}
		: null;

	return {
		membershipDefault,
		isLoading,
		error: error ?? null,
		refetch,
	};
}

export interface UpdateOrgMembershipDefaultInput {
	orgId: string;
	patch: { isApproved?: boolean };
	context?: SchemaContext;
}

export function useUpdateOrgMembershipDefault(_defaultContext: SchemaContext = 'schema-builder') {
	const queryClient = useQueryClient();
	const updateMutation = useUpdateOrgMembershipDefaultByEntityIdMutation();

	return {
		updateMembershipDefault: async (input: UpdateOrgMembershipDefaultInput) => {
			const result = await updateMutation.mutateAsync({
				input: {
					entityId: input.orgId,
					patch: input.patch,
				},
			});
			// Invalidate cache
			queryClient.invalidateQueries({
				queryKey: orgMembershipDefaultByEntityIdQueryKey({ entityId: input.orgId }),
			});
			return result.updateOrgMembershipDefaultByEntityId?.orgMembershipDefault ?? null;
		},
		isUpdating: updateMutation.isPending,
		error: updateMutation.error,
		reset: updateMutation.reset,
	};
}

export interface CreateOrgMembershipDefaultInput {
	orgId: string;
	isApproved: boolean;
	context?: SchemaContext;
}

export function useCreateOrgMembershipDefault(_defaultContext: SchemaContext = 'schema-builder') {
	const queryClient = useQueryClient();
	const createMutation = useCreateOrgMembershipDefaultMutation();

	return {
		createMembershipDefault: async (input: CreateOrgMembershipDefaultInput) => {
			const result = await createMutation.mutateAsync({
				input: {
					orgMembershipDefault: {
						entityId: input.orgId,
						isApproved: input.isApproved,
					},
				},
			});
			// Invalidate cache
			queryClient.invalidateQueries({
				queryKey: orgMembershipDefaultByEntityIdQueryKey({ entityId: input.orgId }),
			});
			return result.createOrgMembershipDefault?.orgMembershipDefault ?? null;
		},
		isCreating: createMutation.isPending,
		error: createMutation.error,
		reset: createMutation.reset,
	};
}

// Re-export SDK query key for consumers to migrate
export { orgMembershipDefaultByEntityIdQueryKey };
