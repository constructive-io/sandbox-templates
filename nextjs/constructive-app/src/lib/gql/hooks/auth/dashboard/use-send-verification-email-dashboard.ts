import { useMutation, useQueryClient } from '@tanstack/react-query';

import { graphql } from '@/graphql';
import { executeInContext } from '@/graphql/execute';

import { authKeys } from '../../query-keys';
import type { SendVerificationEmailMutationResult, SendVerificationEmailMutationVariables } from './auth-types';

/**
 * SendVerificationEmail mutation for dashboard endpoint
 */
const SEND_VERIFICATION_EMAIL_MUTATION = graphql<
	SendVerificationEmailMutationResult,
	SendVerificationEmailMutationVariables
>(/* GraphQL */ `
	mutation SendVerificationEmail($input: SendVerificationEmailInput!) {
		sendVerificationEmail(input: $input) {
			boolean
			clientMutationId
		}
	}
`);

/**
 * Dashboard send verification email hook
 */
export function useSendVerificationEmailDashboard() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: authKeys.sendVerificationEmail.queryKey,
		mutationFn: async (input: { email: string }) => {
			const result = await executeInContext('dashboard', SEND_VERIFICATION_EMAIL_MUTATION, {
				input: { email: input.email },
			});

			if (!result.sendVerificationEmail?.boolean) {
				throw new Error('Failed to send verification email. Please try again.');
			}

			return { success: true, email: input.email };
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: authKeys._def });
		},
	});
}
