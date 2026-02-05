import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { RegisterFormData } from '@/lib/auth/schemas';
import { TokenManager } from '@/lib/auth/token-manager';
import { useAppStore, useAuthActions } from '@/store/app-store';
import type { UserProfile } from '@/store/auth-slice';
import { graphql } from '@/graphql';
import { executeInContext } from '@/graphql/execute';

import { authKeys } from '../../query-keys';
import { toApiToken, type SignUpMutationResult, type SignUpMutationVariables } from './auth-types';

/**
 * SignUp mutation for dashboard endpoint (new schema - Jan 2025)
 */
const SIGN_UP_MUTATION = graphql<SignUpMutationResult, SignUpMutationVariables>(/* GraphQL */ `
	mutation SignUp($input: SignUpInput!) {
		signUp(input: $input) {
			result {
				id
				userId
				accessToken
				accessTokenExpiresAt
				isVerified
				totpEnabled
			}
		}
	}
`);

/**
 * Dashboard register hook
 * Handles user registration against dashboard/CRM endpoint
 * Unlike schema-builder, dashboard registration does NOT trigger email verification flow
 * and directly logs in the user
 */
export function useRegisterDashboard() {
	const queryClient = useQueryClient();
	const authActions = useAuthActions();

	return useMutation({
		mutationKey: authKeys.signUp.queryKey,
		mutationFn: async (formData: RegisterFormData) => {
			// Get the dashboard scope (databaseId)
			const dashboardScope = useAppStore.getState().dashboardScope.databaseId ?? undefined;

			const result = await executeInContext('dashboard', SIGN_UP_MUTATION, {
				input: {
					email: formData.email,
					password: formData.password,
					rememberMe: formData.rememberMe ?? true,
				},
			});

			const signUpResult = result.signUp?.result;
			const token = signUpResult ? toApiToken(signUpResult) : null;

			return {
				token,
				rememberMe: formData.rememberMe ?? true,
				email: formData.email,
				scope: dashboardScope,
			};
		},
		onSuccess: async ({ token, rememberMe, email, scope }) => {
			// Dashboard: directly authenticate (no email verification flow)
			if (token) {
				TokenManager.setToken(token, rememberMe, 'dashboard', scope);

				const user: UserProfile = {
					id: token.userId,
					email: email || '',
				};

				authActions.setAuthenticated(user, token, rememberMe, 'dashboard', scope);
			}

			queryClient.invalidateQueries({ queryKey: authKeys._def });
		},
		onError: () => {
			const dashboardScope = useAppStore.getState().dashboardScope.databaseId ?? undefined;
			authActions.setUnauthenticated('dashboard', dashboardScope);
		},
	});
}
