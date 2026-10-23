import { useMutation, useQueryClient } from '@tanstack/react-query';

import { beginSignOut } from '@/lib/auth/sign-out-transition';
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
			// SSO lane: revoke the gateway credential and expire the session
			// cookie. This is the sign-out: the gateway's own /logout only signs
			// out on a POST from its own form (CSRF-checked), so nothing here can
			// hand the job to it.
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
			// This state flip is a handoff, not a signed-out visit: tell the
			// app's auth-reactive redirects (the home loop guard, RouteGuard,
			// the org layout) to stand down before they see it.
			beginSignOut();

			// Clear token and auth state
			TokenManager.clearToken('admin');
			reconfigureSdkClients();
			authActions.setUnauthenticated();

			// Clear all queries
			queryClient.clear();

			// Retire the loop marker. The hard navigation reloads the app, but
			// this keeps the next mount from inheriting the previous trip's
			// state if the browser restores the page.
			try {
				window.sessionStorage.removeItem('sent-to-login');
			} catch {
				// storage-less tab: nothing to retire
			}

			// The session is already revoked and its cookie gone, so go straight
			// to the gateway's sign-in page. Not via its /logout: a GET there only
			// asks "Sign out?" again, which would make a signed-out user click
			// twice. This must be a hard navigation, to land ON the mantra page
			// rather than bounce through this app's auth state.
			//
			// That sign-in page carries its own `next=/`: without one, every lane
			// on it (password, phone, SSO) falls back to `/login` and a fresh sign-in
			// lands on mantra's "Signed in" card instead of the gateway root, whose
			// app-origin redirect is what brings the browser back into this app.
			window.location.assign(`${getSSOGatewayOrigin()}/login?next=${encodeURIComponent('/')}`);
		},
	});
}
