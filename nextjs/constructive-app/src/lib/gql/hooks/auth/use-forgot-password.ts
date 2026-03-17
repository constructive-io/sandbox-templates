import { useMutation } from '@tanstack/react-query';

import { useForgotPasswordMutation } from '@sdk/auth';

import { authKeys } from '../query-keys';

interface ForgotPasswordInput {
	email: string;
}

/**
 * Forgot password hook using SDK-generated mutation
 */
export function useForgotPassword() {
	const forgotPasswordMutation = useForgotPasswordMutation({ selection: { fields: { clientMutationId: true } } });

	return useMutation({
		mutationKey: authKeys.forgotPassword.queryKey,
		mutationFn: async ({ email }: ForgotPasswordInput) => {
			await forgotPasswordMutation.mutateAsync({
				input: { email },
			});
			return { email };
		},
	});
}
