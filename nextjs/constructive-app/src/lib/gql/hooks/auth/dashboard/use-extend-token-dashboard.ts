import { useMutation, useQueryClient } from '@tanstack/react-query';

import { TokenManager } from '@/lib/auth/token-manager';
import { useAppStore, useAuthActions } from '@/store/app-store';
import { graphql } from '@/graphql';
import { executeInContext } from '@/graphql/execute';

import { authKeys } from '../../query-keys';
import type { ExtendTokenExpiresMutationResult, ExtendTokenExpiresMutationVariables } from './auth-types';

/**
 * ExtendTokenExpires mutation for dashboard endpoint (new schema - Jan 2025)
 * Note: apiToken no longer returns accessToken, only accessTokenHash
 */
const EXTEND_TOKEN_MUTATION = graphql<ExtendTokenExpiresMutationResult, ExtendTokenExpiresMutationVariables>(/* GraphQL */ `
	mutation ExtendTokenExpires($input: ExtendTokenExpiresInput!) {
		extendTokenExpires(input: $input) {
			apiToken {
				id
				userId
				accessTokenHash
				accessTokenExpiresAt
				isVerified
				totpEnabled
			}
		}
	}
`);

/**
 * Dashboard extend token hook
 *
 * Note: As of Jan 2025 schema change, extendTokenExpires no longer returns
 * the actual accessToken (only accessTokenHash). We only update the expiration
 * time while keeping the existing token.
 */
export function useExtendTokenDashboard() {
	const queryClient = useQueryClient();
	const authActions = useAuthActions();

	return useMutation({
		mutationKey: authKeys.extendToken.queryKey,
		mutationFn: async (intervalInput?: { hours?: number; minutes?: number; days?: number }) => {
			// Get current dashboard scope and auth state
			const dashboardScope = useAppStore.getState().dashboardScope.databaseId ?? undefined;
			const dashboardAuth = dashboardScope
				? useAppStore.getState().dashboardAuthByScope[dashboardScope]
				: null;

			if (!dashboardAuth?.token) {
				throw new Error('Token extension failed: No current token');
			}

			const rememberMe = dashboardAuth.rememberMe;
			const currentToken = dashboardAuth.token;

			const result = await executeInContext('dashboard', EXTEND_TOKEN_MUTATION, {
				input: {
					amount: intervalInput || { hours: 1 },
				},
			});

			const apiTokenResponse = result.extendTokenExpires?.apiToken;
			if (!apiTokenResponse?.accessTokenExpiresAt) {
				throw new Error('Token extension failed: No expiration received');
			}

			// Return updated token with new expiration but same accessToken
			return {
				token: {
					...currentToken,
					accessTokenExpiresAt: apiTokenResponse.accessTokenExpiresAt,
				},
				rememberMe,
				scope: dashboardScope,
			};
		},
		onSuccess: ({ token, rememberMe, scope }) => {
			// Update token in storage and state
			TokenManager.setToken(token, rememberMe, 'dashboard', scope);
			authActions.updateToken(token, 'dashboard', scope);

			// Invalidate auth-related queries
			queryClient.invalidateQueries({ queryKey: authKeys._def });
		},
	});
}
