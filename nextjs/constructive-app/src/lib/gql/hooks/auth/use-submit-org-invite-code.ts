import { useMutation } from '@tanstack/react-query';

import { useSubmitOrgInviteCodeMutation } from '@sdk/admin';

/**
 * Submit org invite code hook using SDK-generated mutation
 */
export function useSubmitOrgInviteCode() {
	const submitOrgInviteMutation = useSubmitOrgInviteCodeMutation({ selection: { fields: { result: true } } });

	return useMutation({
		mutationKey: ['invite', 'submit-org-invite-code'],
		mutationFn: async (token: string) => {
			const result = await submitOrgInviteMutation.mutateAsync({
				input: { token },
			});
			if (!result.submitOrgInviteCode?.result) {
				throw new Error('Invite could not be accepted.');
			}
			return { success: true };
		},
	});
}
