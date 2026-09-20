'use client';

import React, { useEffect, useState } from 'react';
import type { Route } from 'next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { useCurrentUserAppMembership } from '@/lib/gql/hooks/admin/app';
import { AccessDenied } from '@/components/access-denied/access-denied';
import { getHomePath } from '@/app-config';
import {
	getRouteAccessType,
	getRouteContext,
	getRouteRedirectTarget,
	getRouteRequiredPermission,
	ROUTE_PATHS,
} from '@/app-routes';
import { INVITE_QUERY_PARAMS } from '@/app/invite/page';

import { useAuthContext } from './auth-context';
import { TokenManager } from './token-manager';

/**
 * Default loading fallback component
 */
function AuthLoadingFallback() {
	return (
		<div
			data-part-id='auth-loading-fallback'
			className='bg-background flex min-h-screen w-dvw items-center justify-center'
		>
			<div className='flex flex-col items-center space-y-4'>
				<Loader2 className='text-primary h-8 w-8 animate-spin' />
				<p className='text-muted-foreground text-sm'>Loading...</p>
			</div>
		</div>
	);
}

/**
 * Guest-only render gate.
 *
 * Lives in a child component because its useSearchParams call is what
 * suspends (or client-side-bails-out) the closest Suspense boundary during
 * prerender — keeping it out of RouteGuard means protected pages never
 * lose their server-rendered shell to that bailout and hydrate cleanly.
 */
function GuestOnlyGate({
	isLoading,
	isAuthenticated,
	mounted,
	ctx,
	children,
}: {
	isLoading: boolean;
	isAuthenticated: boolean;
	mounted: boolean;
	ctx: Parameters<typeof getHomePath>[0];
	children: React.ReactNode;
}) {
	const searchParams = useSearchParams();

	// Check for invite token - if present, show loading while checking auth or if authenticated
	const inviteToken = searchParams?.get(INVITE_QUERY_PARAMS.INVITE_TOKEN);
	if (inviteToken) {
		// If still loading auth state, show loading to prevent flash
		if (isLoading) {
			return <AuthLoadingFallback />;
		}
		// If authenticated, show loading while redirecting
		if (isAuthenticated) {
			return <AuthLoadingFallback />;
		}
		// If not authenticated and not loading, allow register page to show
	}

	// Storage reads are browser-only — until mounted, render the same tree
	// the server rendered so hydration matches; the gate re-runs after mount.
	if (!mounted) {
		return <>{children}</>;
	}
	// If there's no token at all, render immediately without waiting for auth loading
	if (isLoading && !TokenManager.hasToken(ctx)) {
		return <>{children}</>;
	}
	// If there might be a token, wait for auth state to be determined
	if (isLoading) {
		return <AuthLoadingFallback />;
	}
	// Prevent flash of guest content when authenticated
	if (isAuthenticated) {
		return <AuthLoadingFallback />;
	}
	return <>{children}</>;
}

/**
 * Route guard component that handles authentication routing.
 *
 * Route access types are defined centrally in app-routes.ts:
 * - 'public': Renders immediately (auth may be handled by embedded AuthGate)
 * - 'protected': Requires authentication - redirects to root (/) if not authenticated
 * - 'guest-only': Only accessible when NOT authenticated
 * - 'redirect': Immediately redirects to configured target
 *
 * Permission types:
 * - 'app-admin': Requires app_memberships.is_admin = true
 *
 */
export function RouteGuard({ children }: { children: React.ReactNode }) {
	const { isAuthenticated, isLoading } = useAuthContext();
	const pathname = usePathname();
	const router = useRouter();
	// Browser storage only exists after mount: any render that branches on it
	// (TokenManager.hasToken below) would let SSR and the first client render
	// disagree — the classic hydration mismatch on guest-only pages.
	const [mounted, setMounted] = useState(false);
	useEffect(() => {
		setMounted(true);
	}, []);

	// Get route configuration from centralized config
	const accessType = getRouteAccessType(pathname);
	const ctx = getRouteContext(pathname);
	const redirectTarget = getRouteRedirectTarget(pathname);
	const requiredPermission = getRouteRequiredPermission(pathname);

	// Get app membership for permission checks (only when authenticated and permission required)
	const { isAppAdmin, isLoading: isAppMembershipLoading } = useCurrentUserAppMembership({
		enabled: isAuthenticated && requiredPermission === 'app-admin',
	});

	useEffect(() => {
		// Child effects run before AuthProvider's mount effect, so until
		// mounted flips, isLoading/isAuthenticated still hold their initial
		// unauthenticated values — redirecting on them would bounce a
		// signed-in hard load to / before the session check starts (the
		// loading gate initializeAuth sets lives in the parent).
		if (!mounted) {
			return;
		}

		// Handle redirect routes immediately
		if (accessType === 'redirect' && redirectTarget) {
			router.replace(redirectTarget);
			return;
		}

		// Skip redirects during loading - this prevents premature redirects
		if (isLoading) {
			return;
		}

		// Handle protected routes - redirect to root if not authenticated
		if (accessType === 'protected' && !isAuthenticated) {
			router.replace(ROUTE_PATHS.ROOT);
			return;
		}

		// Handle guest-only routes - only redirect if definitely authenticated
		if (accessType === 'guest-only' && isAuthenticated) {
			// Effects run client-side only, so the address bar is a safe
			// source for the query params the redirect needs.
			const search = new URLSearchParams(window.location.search);
			// Invite links win: keep every query param on the trip to /invite.
			if (search.has(INVITE_QUERY_PARAMS.INVITE_TOKEN)) {
				router.replace(`/invite${window.location.search}` as Route);
				return;
			}
			const raw = search.get('redirect');
			const redirectParam =
				raw && raw.startsWith('/') && !raw.startsWith('//') ? raw : null;
			const target = redirectParam || getHomePath(ctx);
			router.replace(target as Route);
			return;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isAuthenticated, isLoading, accessType, pathname, redirectTarget, mounted]);

	// Handle redirect routes - show loading while redirecting
	if (accessType === 'redirect') {
		return <AuthLoadingFallback />;
	}

	// For protected routes, defer loading UI to the shell
	if (accessType === 'protected') {
		// Same hydration rule as guest-only below: the server renders children
		// here (its isLoading is true), while the client auth store starts
		// unauthenticated with isLoading=false — branching on it before mount
		// is the hydration mismatch that regenerates the tree and bounces a
		// signed-in hard load to /.
		if (!mounted) {
			return <>{children}</>;
		}
		if (isLoading) {
			return <>{children}</>;
		}
		// If not authenticated, show loading while redirect happens (via useEffect)
		if (!isAuthenticated) {
			return <AuthLoadingFallback />;
		}

		// Check for permission-restricted routes (e.g., app-admin)
		if (requiredPermission === 'app-admin') {
			// Wait for app membership to load
			if (isAppMembershipLoading) {
				return <AuthLoadingFallback />;
			}
			// If not an app admin, show access denied (renders within shell)
			if (!isAppAdmin) {
				return <AccessDenied />;
			}
		}

		// Authenticated and has permission - render children
		return <>{children}</>;
	}

	// For public routes, render immediately regardless of auth state
	if (accessType === 'public') {
		return <>{children}</>;
	}

	// For guest-only routes, optimize loading state
	if (accessType === 'guest-only') {
		return (
			<GuestOnlyGate
				isLoading={isLoading}
				isAuthenticated={isAuthenticated}
				mounted={mounted}
				ctx={ctx}
			>
				{children}
			</GuestOnlyGate>
		);
	}

	return <>{children}</>;
}

// Legacy exports for backward compatibility (deprecated)
export const ProtectedRoute = RouteGuard;
export const GuestRoute = RouteGuard;
export const RouteProtectionWrapper = RouteGuard;
export const AuthenticationWrapper = RouteGuard;

// Legacy utility functions for backward compatibility (deprecated)
export const shouldProtectRoute = (pathname: string): boolean => getRouteAccessType(pathname) === 'protected';
export const shouldBeGuestOnly = (pathname: string): boolean => getRouteAccessType(pathname) === 'guest-only';
