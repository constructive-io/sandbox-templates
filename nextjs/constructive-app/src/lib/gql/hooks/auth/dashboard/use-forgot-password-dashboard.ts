import { useMutation } from '@tanstack/react-query';

import { graphql } from '@/graphql';
import { executeInContext } from '@/graphql/execute';

import { authKeys } from '../../query-keys';
import type { ForgotPasswordMutationResult, ForgotPasswordMutationVariables } from './auth-types';

/**
 * ForgotPassword mutation for dashboard endpoint
 */
const FORGOT_PASSWORD_MUTATION = graphql<ForgotPasswordMutationResult, ForgotPasswordMutationVariables>(/* GraphQL */ `
	mutation ForgotPassword($input: ForgotPasswordInput!) {
		forgotPassword(input: $input) {
			clientMutationId
		}
	}
`);

/**
 * Dashboard forgot password hook
 */
export function useForgotPasswordDashboard() {
	return useMutation({
		mutationKey: authKeys.forgotPassword.queryKey,
		mutationFn: async ({ email }: { email: string }) => {
			await executeInContext('dashboard', FORGOT_PASSWORD_MUTATION, {
				input: { email },
			});
			return { email };
		},
	});
}
