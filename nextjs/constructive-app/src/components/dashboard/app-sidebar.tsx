'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import type { RemixiconComponentType } from '@remixicon/react';
import {
	RiAdminLine,
	RiDatabase2Line,
	RiLeafLine,
	RiLogoutBoxLine,
	RiMailLine,
	RiServerLine,
	RiShieldCheckLine,
	RiTableLine,
	RiUserLine,
} from '@remixicon/react';

import { useLogout } from '@/lib/gql/hooks/auth';
import { useCurrentUserAppMembership } from '@/lib/gql/hooks/schema-builder/app';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuItem,
} from '@constructive-io/ui/sidebar';
import { SidebarNavButton, SidebarNavItem } from '@/components/dashboard/sidebar-nav-item';
import { APP_ROUTES, isRouteActive, type AppRouteKey } from '@/app-routes';

type LinkItem = { title: string; routeKey: AppRouteKey; icon?: RemixiconComponentType };
type RenderItem = { title: string; render: React.ReactNode; icon?: RemixiconComponentType };
type SidebarItem = LinkItem | RenderItem;

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const pathname = usePathname();
	const logoutMutation = useLogout();
	const { isAppAdmin } = useCurrentUserAppMembership();

	const handleLogout = () => {
		logoutMutation.mutate();
	};

	const isActive = (routeKey: AppRouteKey): boolean => {
		return isRouteActive(pathname, routeKey);
	};

	const isRenderItem = (i: SidebarItem): i is RenderItem => 'render' in i;
	const isLinkItem = (i: SidebarItem): i is LinkItem => 'routeKey' in i;

	type NavTestIdKey = AppRouteKey | 'SIGN_OUT';

	const navTestIds: Partial<Record<NavTestIdKey, string>> = {
		ORG_DATABASE_DATA: 'nav-databases-data',
		ORG_DATABASE_SCHEMAS: 'nav-databases-schemas',
		ORG_DATABASE_SERVICES: 'nav-databases-services',
		ORG_DATABASE_SECURITY: 'nav-databases-security',
		APP_INVITES: 'nav-app-invites',
		ACCOUNT_SETTINGS: 'nav-account-settings',
		HELP_CENTER: 'nav-help-center',
		SIGN_OUT: 'nav-signout',
	};

	// Main navigation items (visible to all authenticated users)
	const navItems: SidebarItem[] = [
		{ title: 'Data', routeKey: 'ORG_DATABASE_DATA', icon: RiDatabase2Line },
		{ title: 'Schemas', routeKey: 'ORG_DATABASE_SCHEMAS', icon: RiTableLine },
		{ title: 'Services', routeKey: 'ORG_DATABASE_SERVICES', icon: RiServerLine },
		{ title: 'Security', routeKey: 'ORG_DATABASE_SECURITY', icon: RiShieldCheckLine },
		{ title: 'Invites', routeKey: 'APP_INVITES', icon: RiMailLine },
		{ title: 'Account', routeKey: 'ACCOUNT_SETTINGS', icon: RiUserLine },
		{ title: 'Help Center', routeKey: 'HELP_CENTER', icon: RiLeafLine },
	];

	// App-level admin items (only visible to app admins)
	const appAdminItems: SidebarItem[] = [
		{ title: 'App Users', routeKey: 'APP_USERS', icon: RiUserLine },
		{ title: 'App Invites', routeKey: 'APP_INVITES', icon: RiMailLine },
		{ title: 'App Settings', routeKey: 'APP_SETTINGS', icon: RiAdminLine },
	];

	const renderNavItem = (menuItem: SidebarItem) => {
		// Custom render item
		if (isRenderItem(menuItem)) {
			return <SidebarMenuItem key={menuItem.title}>{menuItem.render}</SidebarMenuItem>;
		}

		if (isLinkItem(menuItem)) {
			const active = isActive(menuItem.routeKey);
			const routePath = APP_ROUTES[menuItem.routeKey].path;
			const testId = navTestIds[menuItem.routeKey];

			return (
				<SidebarNavItem
					key={menuItem.title}
					title={menuItem.title}
					href={routePath}
					icon={menuItem.icon}
					isActive={active}
					testId={testId}
				/>
			);
		}
		return null;
	};

	return (
		<Sidebar {...props}>
			<SidebarContent className='px-2 pt-2'>
				{/* Main navigation */}
				<SidebarMenu>{navItems.map(renderNavItem)}</SidebarMenu>

				{/* App admin section - only visible to app admins */}
				{isAppAdmin && (
					<>
						<SidebarGroupLabel className='text-muted-foreground mt-4 px-2 text-xs font-medium'>
							Platform Admin
						</SidebarGroupLabel>
						<SidebarMenu>{appAdminItems.map(renderNavItem)}</SidebarMenu>
					</>
				)}
			</SidebarContent>
			<SidebarFooter>
				<hr className='border-border/60 mx-2 -mt-px border-t' />
				<SidebarMenu>
					<SidebarNavButton
						title='Sign Out'
						icon={RiLogoutBoxLine}
						onClick={handleLogout}
						disabled={logoutMutation.isPending}
						testId={navTestIds.SIGN_OUT}
					/>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
