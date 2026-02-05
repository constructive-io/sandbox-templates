'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCardStack } from '@constructive-io/ui/stack';

import { useLogout } from '@/lib/gql/hooks/auth';
import { useOrganizations } from '@/lib/gql/hooks/schema-builder';
import { useCurrentUserAppMembership } from '@/lib/gql/hooks/schema-builder/app';
import { useEntityParams, useSidebarNavigation } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { useSchemaBuilderAuth, useSidebarPinned, useSidebarPinnedActions } from '@/store/app-store';
import { AppShell } from '@/components/app-shell/app-shell';
import type { EntityLevel, TopBarConfig } from '@/components/app-shell/app-shell.types';
// UserDropdown removed - dashboard components have been removed from the application
import { ConstructiveIcon } from '@/components/icons/constructive-icon';
import { ConstructiveLogo } from '@/components/icons/constructive-logo';
import { CreateOrganizationCard } from '@/components/organizations/create-organization-card';
import { ShellContentFallback, ShellFrameSkeleton } from '@/components/skeletons';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { buildOrgRoute, getRouteAccessType } from '@/app-routes';

export interface AuthenticatedShellProps {
	children: React.ReactNode;
}

/**
 * Shell wrapper that conditionally renders the AppShell based on Tier 1 (schema-builder) auth state.
 * Lives in root layout so sidebar state is preserved across route navigations.
 *
 * Loading Strategy:
 * - Protected routes show shell frame immediately with content skeleton
 * - Auth check happens in parallel, not blocking shell structure
 * - Page components handle their own loading states once shell is visible
 *
 * Two-Tier Auth Architecture:
 * - Tier 1 (schema-builder): App-level auth - controls shell visibility
 * - Tier 2 (dashboard): Per-database auth - controlled by AuthGate in dashboard layout
 */
export function AuthenticatedShell({ children }: AuthenticatedShellProps) {
	const pathname = usePathname();
	const [hasMounted, setHasMounted] = React.useState(false);
	const { isAuthenticated, isLoading } = useSchemaBuilderAuth();

	const accessType = getRouteAccessType(pathname);
	const isProtectedRoute = accessType === 'protected';
	const isInviteRoute = pathname === '/invite';

	// On SSR and before hydration, assume not authenticated
	const isAuthenticatedReady = hasMounted ? isAuthenticated : false;
	// Show shell for protected routes (even during loading) or when authenticated
	const shouldUseShell = isProtectedRoute || isAuthenticatedReady;

	React.useEffect(() => {
		setHasMounted(true);
	}, []);

	// Guest-only routes (login, register) or public routes when not authenticated
	if (!shouldUseShell) {
		return <>{children}</>;
	}

	// Protected routes during loading: show shell frame with content skeleton
	// This provides immediate visual feedback and stable layout
	if (!hasMounted || isLoading) {
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
	return <AuthenticatedShellInner hideSidebar={isInviteRoute}>{children}</AuthenticatedShellInner>;
}

/**
 * Inner component that handles the authenticated shell with dynamic navigation.
 * Separated to ensure hooks are called only when authenticated.
 */
function AuthenticatedShellInner({ children, hideSidebar }: AuthenticatedShellProps & { hideSidebar?: boolean }) {
	const pathname = usePathname();
	const router = useRouter();
	const stack = useCardStack();
	const logoutMutation = useLogout();
	const { isAppAdmin } = useCurrentUserAppMembership();
	const { refetch: refetchOrganizations } = useOrganizations();

	// Sidebar pinned state from Zustand (persisted)
	const sidebarPinned = useSidebarPinned();
	const { toggleSidebarPinned } = useSidebarPinnedActions();

	// Get entity state from URL params (source of truth)
	const { orgId, availableOrgs } = useEntityParams();

	const handleLogout = React.useCallback(() => {
		logoutMutation.mutate();
	}, [logoutMutation]);

	// Get dynamic navigation based on URL params (source of truth)
	const { navigation } = useSidebarNavigation({
		isAppAdmin,
		onLogout: handleLogout,
	});

	// Handle org selection - navigates to org members route (URL is source of truth)
	const handleOrgChange = React.useCallback(
		(newOrgId: string) => {
			router.push(buildOrgRoute('ORG_MEMBERS', newOrgId));
		},
		[router],
	);

	// Build entity levels for breadcrumbs based on URL params
	const entityLevels = React.useMemo((): EntityLevel[] => {
		const levels: EntityLevel[] = [];

		// Organization level - only show if orgId is in URL
		if (orgId) {
			levels.push({
				id: 'organization',
				label: 'Organization',
				labelPlural: 'Organizations',
				entities: availableOrgs,
				activeEntityId: orgId,
				onEntityChange: handleOrgChange,
				onCreateNew: () => {
					stack.push({
						id: 'org-create',
						title: 'Create Organization',
						description: 'Create a new organization to collaborate with your team.',
						Component: CreateOrganizationCard,
						props: {
							onSuccess: () => refetchOrganizations(),
						},
						width: 480,
					});
				},
				createLabel: 'Create organization',
				viewAllHref: '/',
			});
		}

		return levels;
	}, [orgId, availableOrgs, handleOrgChange, stack, refetchOrganizations]);

	const topBarConfig: TopBarConfig = {
		sidebarLogo: (
			<Link
				href='/'
				className={cn(
					'flex items-center transition-opacity hover:opacity-80',
					sidebarPinned ? 'w-full justify-start pl-4' : 'justify-center',
				)}
			>
				{sidebarPinned ? (
					<ConstructiveLogo className='w-[120px]' />
				) : (
					<ConstructiveIcon className='text-primary h-6 w-6' />
				)}
			</Link>
		),
		entityLevels,
		actions: (
			<>
				<ThemeSwitcher />
			</>
		),
	};

	return (
		<AppShell
			navigation={navigation}
			topBar={topBarConfig}
			hideSidebar={hideSidebar}
			sidebarPinned={sidebarPinned}
			onToggleSidebarPin={toggleSidebarPinned}
		>
			<React.Suspense fallback={<ShellContentFallback />}>{children}</React.Suspense>
		</AppShell>
	);
}
