import { useQueryClient } from '@tanstack/react-query';

import type { SchemaContext } from '@/app-config';
import {
	useCreateOrgInviteMutation,
	useDeleteOrgInviteMutation,
	useUpdateOrgInviteMutation,
} from '@sdk/api';

import { orgInvitesQueryKeys } from './use-org-invites';

export interface SendOrgInviteInput {
	orgId: string;
	email: string;
	expiresAt: string;
	context?: SchemaContext;
}

export function useSendOrgInvite(defaultContext: SchemaContext = 'schema-builder') {
	void defaultContext;
	const queryClient = useQueryClient();
	const createMutation = useCreateOrgInviteMutation();

	return {
		sendInvite: async (input: SendOrgInviteInput) => {
			const ctx = input.context ?? defaultContext;
			const result = await createMutation.mutateAsync({
				input: {
					orgInvite: {
						entityId: input.orgId,
						email: input.email,
						expiresAt: input.expiresAt,
						// TODO: fix permission denied for table org_invites
						// data: {
						// 	email: input.email,
						// 	role: 'member',
						// 	message: null,
						// },
					},
				},
			});
			queryClient.invalidateQueries({ queryKey: orgInvitesQueryKeys.active(ctx, input.orgId) });
			queryClient.invalidateQueries({ queryKey: orgInvitesQueryKeys.claimed(ctx, input.orgId) });
			return result.createOrgInvite?.orgInvite ?? null;
		},
		isSending: createMutation.isPending,
		error: createMutation.error,
		reset: createMutation.reset,
	};
}

export interface CancelOrgInviteInput {
	orgId: string;
	inviteId: string;
	context?: SchemaContext;
}

export function useCancelOrgInvite(defaultContext: SchemaContext = 'schema-builder') {
	void defaultContext;
	const queryClient = useQueryClient();
	const deleteMutation = useDeleteOrgInviteMutation();

	return {
		cancelInvite: async (input: CancelOrgInviteInput) => {
			const ctx = input.context ?? defaultContext;
			await deleteMutation.mutateAsync({ input: { id: input.inviteId } });
			queryClient.invalidateQueries({ queryKey: orgInvitesQueryKeys.active(ctx, input.orgId) });
			return input.inviteId;
		},
		isCancelling: deleteMutation.isPending,
		error: deleteMutation.error,
		reset: deleteMutation.reset,
	};
}

export interface ExtendOrgInviteInput {
	orgId: string;
	inviteId: string;
	expiresAt: string;
	context?: SchemaContext;
}

export function useExtendOrgInvite(defaultContext: SchemaContext = 'schema-builder') {
	void defaultContext;
	const queryClient = useQueryClient();
	const updateMutation = useUpdateOrgInviteMutation();

	return {
		extendInvite: async (input: ExtendOrgInviteInput) => {
			const ctx = input.context ?? defaultContext;
			const result = await updateMutation.mutateAsync({
				input: {
					id: input.inviteId,
					patch: {
						expiresAt: input.expiresAt,
					},
				},
			});
			queryClient.invalidateQueries({ queryKey: orgInvitesQueryKeys.active(ctx, input.orgId) });
			queryClient.invalidateQueries({ queryKey: orgInvitesQueryKeys.claimed(ctx, input.orgId) });
			return result.updateOrgInvite?.orgInvite ?? null;
		},
		isExtending: updateMutation.isPending,
		error: updateMutation.error,
		reset: updateMutation.reset,
	};
}
