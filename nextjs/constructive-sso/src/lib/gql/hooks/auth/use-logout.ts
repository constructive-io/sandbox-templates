import { useMutation, useQueryClient } from '@tanstack/react-query';

import { TokenManager } from '@/lib/auth/token-manager';
import { reconfigureSdkClients } from '@/components/app-provider';
import { useAuthActions } from '@/store/app-store';
import { getSSOGatewayOrigin } from '@/app-config';
import { useSignOutMutation } from '@sdk/auth';

import { authKeys } from '../query-keys';

/**
 * Logout hook using SDK-generated mutation
 */
export function useLogout() {
	const queryClient = useQueryClient();
	const authActions = useAuthActions();
	const signOutMutation = useSignOutMutation({ selection: { fields: { clientMutationId: true } } });

	return useMutation({
		mutationKey: authKeys.signOut.queryKey,
		mutationFn: async () => {
			// Legacy password lane (best-effort, continue even if it fails — SSO
			// sessions don't live here).
			try {
				await signOutMutation.mutateAsync({
					input: {},
				});
			} catch {
				// Server-side logout failed, but we still clear local state
			}
			// SSO lane: revoke the gateway credential and expire the BFF session
			// cookie. Best-effort too — the gateway /logout handoff below revokes
			// and clears cookies itself.
			try {
				await fetch('/api/auth/sign-out', {
					method: 'POST',
					credentials: 'include',
					headers: { 'content-type': 'application/json' },
					body: '{}'
				});
			} catch {
				// Fall through to the gateway handoff
			}
		},
		onSuccess: () => {
			// Clear token and auth state
			TokenManager.clearToken('admin');
			reconfigureSdkClients();
			authActions.setUnauthenticated();

			// Clear all queries
			queryClient.clear();

			// Hand the browser to the gateway's own /logout page: it revokes the
			// session and clears the cookies that carried it (gateway `token` plus
			// the challenge cookie — cookies are host-scoped, so an SPA route here
			// can't reliably retire them), then redirects to the mantra sign-in
			// page (`next` is resolved relative to the gateway). This must be a
			// hard navigation: the goal is to land ON the mantra page with every
			// session cookie gone, not to bounce through this app's auth state.
			window.location.assign(`${getSSOGatewayOrigin()}/logout?next=%2Flogin`);
		},
	});
}
