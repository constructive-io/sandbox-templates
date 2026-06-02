'use client';

import * as React from 'react';
import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useLogout } from '@/lib/gql/hooks/auth';
import { useSidebarNavigation } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { useAuth, useSidebarPinned, useSidebarPinnedActions } from '@/store/app-store';
import { AppShell } from '@/components/app-shell/app-shell';
import type { TopBarConfig } from '@/components/app-shell/app-shell.types';
import { UserDropdown } from '@/components/app-shell/user-dropdown';
import { BrandLogo } from '@/components/brand-logo';
import { branding } from '@/config/branding';
import { ShellContentFallback, ShellFrameSkeleton } from '@/components/skeletons';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { getRouteAccessType } from '@/app-routes';

export interface AuthenticatedShellProps {
	children: React.ReactNode;
}

/**
 * Shell wrapper that conditionally renders the AppShell based on auth state.
 * Lives in root layout so sidebar state is preserved across route navigations.
 *
 * Loading Strategy:
 * - Protected routes show shell frame immediately with content skeleton
 * - Auth check happens in parallel, not blocking shell structure
 * - Page components handle their own loading states once shell is visible
 */
export function AuthenticatedShell({ children }: AuthenticatedShellProps) {
	const pathname = usePathname();
	const { isAuthenticated, isLoading } = useAuth();

	const accessType = getRouteAccessType(pathname);
	const isProtectedRoute = accessType === 'protected';

	// During loading, assume not authenticated to avoid hydration mismatches
	const isAuthenticatedReady = isLoading ? false : isAuthenticated;
	// Show shell for protected routes (even during loading) or when authenticated
	const shouldUseShell = isProtectedRoute || isAuthenticatedReady;

	// Guest-only routes (login, register) or public routes when not authenticated
	if (!shouldUseShell) {
		return <>{children}</>;
	}

	// Protected routes during loading: show shell frame with content skeleton
	// This provides immediate visual feedback and stable layout
	if (isLoading) {
		return (
			<ShellFrameSkeleton>
				<ShellContentFallback />
			</ShellFrameSkeleton>
		);
	}

	// Not authenticated after loading: show children (will redirect via RouteGuard)
	if (!isAuthenticated) {
		return <>{children}</>;
	}

	// Authenticated: render full shell
	return <AuthenticatedShellInner>{children}</AuthenticatedShellInner>;
}

/**
 * Inner component that handles the authenticated shell with dynamic navigation.
 * Separated to ensure hooks are called only when authenticated.
 */
function AuthenticatedShellInner({ children }: AuthenticatedShellProps) {
	const logoutMutation = useLogout();

	// Sidebar pinned state from Zustand (persisted)
	const sidebarPinned = useSidebarPinned();
	const { toggleSidebarPinned } = useSidebarPinnedActions();

	const handleLogout = React.useCallback(() => {
		logoutMutation.mutate();
	}, [logoutMutation]);

	// Base tier navigation: Home + Account (single app-root level).
	const { navigation } = useSidebarNavigation({
		onLogout: handleLogout,
	});

	const topBarConfig: TopBarConfig = {
		sidebarLogo: (
			<Link
				href={branding.homePath as Route}
				className={cn(
					'flex items-center transition-opacity hover:opacity-80',
					sidebarPinned ? 'w-full justify-start pl-4' : 'justify-center',
				)}
			>
				{sidebarPinned ? (
					<BrandLogo variant='wordmark' showTagline className='w-[120px]' />
				) : (
					<BrandLogo variant='icon' className='h-6 w-auto' />
				)}
			</Link>
		),
		actions: (
			<>
				<UserDropdown />
				<ThemeSwitcher />
			</>
		),
	};

	return (
		<AppShell
			navigation={navigation}
			topBar={topBarConfig}
			sidebarPinned={sidebarPinned}
			onToggleSidebarPin={toggleSidebarPinned}
		>
			<React.Suspense fallback={<ShellContentFallback />}>{children}</React.Suspense>
		</AppShell>
	);
}
