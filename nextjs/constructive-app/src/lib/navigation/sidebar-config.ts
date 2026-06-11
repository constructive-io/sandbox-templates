import { RiHome4Line, RiUserSettingsLine } from '@remixicon/react';

import type { NavGroup, NavItem } from '@/components/app-shell/app-shell.types';
import { APP_ROUTES } from '@/app-routes';

/**
 * Navigation level (BASE tier).
 * The base auth:email app has a single level: the app root.
 */
export type NavigationLevel = 'root';

export interface SidebarConfigOptions {
	/** Current pathname for active state detection */
	pathname: string;
	/** Logout handler */
	onLogout?: () => void;
	/** Custom render for settings (e.g., RuntimeEndpointsDialog) */
	settingsRender?: React.ReactNode;
	/** Function to check if a route is active */
	isRouteActive?: (routeKey: string) => boolean;
}

/**
 * Root-level navigation: Home + Account.
 *
 * B2B OPT-IN: a b2b app adds an Organizations entry and an org-level group
 * here, wired to the registry org blocks. See docs/B2B.md.
 */
function getRootNavigation(options: SidebarConfigOptions): NavGroup[] {
	const { isRouteActive } = options;

	const mainItems: NavItem[] = [
		{
			id: 'home',
			label: 'Home',
			icon: RiHome4Line,
			href: '/',
			isActive: isRouteActive?.('ROOT'),
		},
	];

	const groups: NavGroup[] = [
		{
			id: 'main',
			position: 'top',
			items: mainItems,
		},
	];

	// Account items
	groups.push({
		id: 'account',
		position: 'top',
		items: [
			{
				id: 'account-settings',
				label: 'Account',
				icon: RiUserSettingsLine,
				href: APP_ROUTES.ACCOUNT_SETTINGS.path,
				isActive: isRouteActive?.('ACCOUNT_SETTINGS'),
			},
		],
	});

	return groups;
}

/**
 * Get sidebar navigation configuration for the current level.
 */
export function getSidebarConfig(_level: NavigationLevel, options: SidebarConfigOptions): NavGroup[] {
	return getRootNavigation(options);
}
