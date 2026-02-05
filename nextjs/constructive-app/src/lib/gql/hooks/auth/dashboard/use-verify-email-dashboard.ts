import { useMutation, useQueryClient } from '@tanstack/react-query';

import { graphql } from '@/graphql';
import { executeInContext } from '@/graphql/execute';

import { authKeys } from '../../query-keys';
import type { VerifyEmailInput, VerifyEmailMutationResult, VerifyEmailMutationVariables } from './auth-types';

/**
 * VerifyEmail mutation for dashboard endpoint
 */
const VERIFY_EMAIL_MUTATION = graphql<VerifyEmailMutationResult, VerifyEmailMutationVariables>(/* GraphQL */ `
	mutation VerifyEmail($input: VerifyEmailInput!) {
		verifyEmail(input: $input) {
			boolean
			clientMutationId
		}
	}
`);

/**
 * Dashboard verify email hook
 */
export function useVerifyEmailDashboard() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: authKeys.verifyEmail.queryKey,
		mutationFn: async (input: VerifyEmailInput) => {
			const result = await executeInContext('dashboard', VERIFY_EMAIL_MUTATION, {
				input: { emailId: input.emailId, token: input.token },
			});

			if (!result.verifyEmail?.boolean) {
				throw new Error('Failed to verify email. The link may have expired or is invalid.');
			}

			return { success: true };
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: authKeys._def });
		},
	});
}
