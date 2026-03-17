import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useVerifyEmailMutation } from '@sdk/auth';

import { authKeys } from '../query-keys';

interface VerifyEmailInput {
	emailId: string;
	token: string;
}

/**
 * Verify email hook using SDK-generated mutation
 */
export function useVerifyEmail() {
	const queryClient = useQueryClient();
	const verifyEmailMutation = useVerifyEmailMutation({ selection: { fields: { result: true } } });

	return useMutation({
		mutationKey: authKeys.verifyEmail.queryKey,
		mutationFn: async (input: VerifyEmailInput) => {
			const result = await verifyEmailMutation.mutateAsync({
				input: { emailId: input.emailId, token: input.token },
			});

			if (!result.verifyEmail?.result) {
				throw new Error('Failed to verify email. The link may have expired or is invalid.');
			}

			return { success: true };
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: authKeys._def });
		},
	});
}
