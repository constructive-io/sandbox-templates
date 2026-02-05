import { useMutation, useQueryClient } from '@tanstack/react-query';

import { TokenManager } from '@/lib/auth/token-manager';
import { useAppStore, useAuthActions } from '@/store/app-store';
import { graphql } from '@/graphql';
import { executeInContext } from '@/graphql/execute';

import { authKeys } from '../../query-keys';
import type { SignOutMutationResult, SignOutMutationVariables } from './auth-types';

/**
 * SignOut mutation for dashboard endpoint
 */
const SIGN_OUT_MUTATION = graphql<SignOutMutationResult, SignOutMutationVariables>(/* GraphQL */ `
	mutation SignOut($input: SignOutInput!) {
		signOut(input: $input) {
			clientMutationId
		}
	}
`);

/**
 * Dashboard logout hook
 * Clears only the current dashboard scope's auth, not schema-builder
 */
export function useLogoutDashboard() {
	const queryClient = useQueryClient();
	const authActions = useAuthActions();

	return useMutation({
		mutationKey: authKeys.signOut.queryKey,
		mutationFn: async () => {
			// Get the dashboard scope (databaseId)
			const dashboardScope = useAppStore.getState().dashboardScope.databaseId ?? undefined;

			// Call signOut mutation (best-effort)
			try {
				await executeInContext('dashboard', SIGN_OUT_MUTATION, {
					input: {},
				});
			} catch {
				// Server-side logout failed, but we still clear local state
			}

			return { scope: dashboardScope };
		},
		onSuccess: ({ scope }) => {
			// Clear only this dashboard scope's token
			TokenManager.clearToken('dashboard', scope);
			authActions.setUnauthenticated('dashboard', scope);

			// Invalidate all queries
			queryClient.invalidateQueries({ queryKey: authKeys._def });

			// Note: Dashboard logout does NOT redirect - the AuthGate will show login form
		},
	});
}
