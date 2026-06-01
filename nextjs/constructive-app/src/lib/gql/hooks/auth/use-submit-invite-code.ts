import { useMutation } from '@tanstack/react-query';

import { useSubmitAppInviteCodeMutation } from '@/lib/gql/admin-compat';

/**
 * Submit invite code hook using SDK-generated mutation
 */
export function useSubmitInviteCode() {
	const submitInviteMutation = useSubmitAppInviteCodeMutation({ selection: { fields: { result: true } } });

	return useMutation({
		mutationKey: ['invite', 'submit-invite-code'],
		mutationFn: async (token: string) => {
			const result = await submitInviteMutation.mutateAsync({
				input: { token },
			});
			if (!result.submitAppInviteCode?.result) {
				throw new Error('Invite could not be accepted.');
			}
			return { success: true };
		},
	});
}
