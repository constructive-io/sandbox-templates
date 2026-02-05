import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createInvalidCredentialsError } from '@/lib/auth/auth-errors';
import type { LoginFormData } from '@/lib/auth/schemas';
import { TokenManager } from '@/lib/auth/token-manager';
import { useAppStore, useAuthActions } from '@/store/app-store';
import type { UserProfile } from '@/store/auth-slice';
import { graphql } from '@/graphql';
import { executeInContext } from '@/graphql/execute';

import { authKeys } from '../../query-keys';
import { toApiToken, type SignInMutationResult, type SignInMutationVariables } from './auth-types';

/**
 * SignIn mutation for dashboard endpoint (new schema - Jan 2025)
 */
const SIGN_IN_MUTATION = graphql<SignInMutationResult, SignInMutationVariables>(/* GraphQL */ `
	mutation SignIn($input: SignInInput!) {
		signIn(input: $input) {
			result {
				id
				userId
				accessToken
				accessTokenExpiresAt
				isVerified
				totpEnabled
			}
			clientMutationId
		}
	}
`);

/**
 * Dashboard login hook
 * Handles user authentication against dashboard/CRM endpoint
 * Tokens are scoped by databaseId
 */
export function useLoginDashboard() {
	const queryClient = useQueryClient();
	const authActions = useAuthActions();

	return useMutation({
		mutationKey: authKeys.signIn.queryKey,
		mutationFn: async (credentials: LoginFormData) => {
			// Get the dashboard scope (databaseId)
			const dashboardScope = useAppStore.getState().dashboardScope.databaseId ?? undefined;

			const result = await executeInContext('dashboard', SIGN_IN_MUTATION, {
				input: {
					email: credentials.email,
					password: credentials.password,
					rememberMe: credentials.rememberMe,
				},
			});

			const signInResult = result.signIn?.result;

			if (!signInResult) {
				throw createInvalidCredentialsError();
			}

			const token = toApiToken(signInResult);

			if (!token) {
				throw createInvalidCredentialsError();
			}

			return {
				token,
				email: credentials.email,
				rememberMe: credentials.rememberMe || false,
				scope: dashboardScope,
			};
		},
		onSuccess: async ({ token, rememberMe, email, scope }) => {
			// Store token scoped for dashboard
			TokenManager.setToken(token, rememberMe, 'dashboard', scope);

			const userId = token.userId ?? token.id;

			const user: UserProfile = {
				id: userId,
				email: email || '',
			};

			// Update auth state (scoped for dashboard)
			authActions.setAuthenticated(user, token, rememberMe, 'dashboard', scope);

			// Invalidate any auth-related queries
			queryClient.invalidateQueries({ queryKey: authKeys._def });
		},
	});
}
