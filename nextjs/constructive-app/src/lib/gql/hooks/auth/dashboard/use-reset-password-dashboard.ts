import { useMutation, useQueryClient } from '@tanstack/react-query';

import { graphql } from '@/graphql';
import { executeInContext } from '@/graphql/execute';

import { authKeys } from '../../query-keys';
import type { ResetPasswordInput, ResetPasswordMutationResult, ResetPasswordMutationVariables } from './auth-types';

/**
 * ResetPassword mutation for dashboard endpoint
 */
const RESET_PASSWORD_MUTATION = graphql<ResetPasswordMutationResult, ResetPasswordMutationVariables>(/* GraphQL */ `
	mutation ResetPassword($input: ResetPasswordInput!) {
		resetPassword(input: $input) {
			boolean
			clientMutationId
		}
	}
`);

/**
 * Dashboard reset password hook
 */
export function useResetPasswordDashboard() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: authKeys.resetPassword.queryKey,
		mutationFn: async (input: ResetPasswordInput) => {
			const result = await executeInContext('dashboard', RESET_PASSWORD_MUTATION, {
				input: {
					newPassword: input.newPassword,
					resetToken: input.resetToken,
					roleId: input.roleId,
				},
			});

			if (!result.resetPassword?.boolean) {
				throw new Error('Failed to reset password. The link may have expired.');
			}

			return { success: true };
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: authKeys._def });
		},
	});
}
