import { useMutation, useQueryClient } from '@tanstack/react-query';

import { TokenManager } from '@/lib/auth/token-manager';
import { useAppStore, useAuthActions } from '@/store/app-store';
import { useExtendTokenExpiresMutation } from '@sdk/auth';

import { authKeys } from '../../query-keys';

/**
 * Schema-builder extend token hook using SDK-generated mutation
 *
 * Note: As of Jan 2025 schema change, extendTokenExpires returns results array
 * with expiresAt instead of apiToken. We only update the expiration time while
 * keeping the existing token.
 */
export function useExtendTokenSb() {
	const queryClient = useQueryClient();
	const authActions = useAuthActions();
	const extendTokenMutation = useExtendTokenExpiresMutation();

	return useMutation({
		mutationKey: authKeys.extendToken.queryKey,
		mutationFn: async (intervalInput?: { hours?: number; minutes?: number; days?: number }) => {
			// Capture rememberMe at mutation time
			const rememberMe = useAppStore.getState().schemaBuilderAuth.rememberMe;
			const currentToken = useAppStore.getState().schemaBuilderAuth.token;

			if (!currentToken) {
				throw new Error('Token extension failed: No current token');
			}

			const result = await extendTokenMutation.mutateAsync({
				input: {
					amount: intervalInput || { hours: 1 },
				},
			});

			// New schema returns results array with expiresAt
			const extendResult = result.extendTokenExpires?.results?.[0];
			if (!extendResult?.expiresAt) {
				throw new Error('Token extension failed: No expiration received');
			}

			// Return updated token with new expiration but same accessToken
			return {
				token: {
					...currentToken,
					accessTokenExpiresAt: extendResult.expiresAt,
				},
				rememberMe,
			};
		},
		onSuccess: ({ token, rememberMe }) => {
			// Update token in storage and state
			TokenManager.setToken(token, rememberMe, 'schema-builder');
			authActions.updateToken(token, 'schema-builder');

			// Invalidate auth-related queries
			queryClient.invalidateQueries({ queryKey: authKeys._def });
		},
	});
}
