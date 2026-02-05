'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';

import { isRouteActive, type AppRouteKey } from '@/app-routes';
import type { NavGroup } from '@/components/app-shell/app-shell.types';

import { getSidebarConfig, type NavigationLevel, type SidebarConfigOptions } from './sidebar-config';
import { useEntityParams } from './use-entity-params';

export interface UseSidebarNavigationOptions {
	/** Whether the current user is an app admin */
	isAppAdmin?: boolean;
	/** Logout handler */
	onLogout?: () => void;
	/** Custom render for settings (e.g., RuntimeEndpointsDialog) */
	settingsRender?: React.ReactNode;
}

export interface UseSidebarNavigationResult {
	/** Current navigation level */
	level: NavigationLevel;
	/** Navigation groups for the current level */
	navigation: NavGroup[];
	/** Active organization ID from URL params */
	activeOrgId: string | null;
	/** Active database ID from URL params */
	activeDatabaseId: string | null;
}

/**
 * Hook to determine the current navigation level and return appropriate sidebar config
 *
 * Level detection is URL-BASED for robust, shareable state:
 * - Entity hierarchy: App (root) → Org → Database
 * - If databaseId in URL → 'database' level
 * - Else if orgId in URL → 'org' level
 * - Else → 'root' level
 *
 * This ensures the sidebar reflects the current URL context.
 * URLs are the source of truth for entity selection.
 */
export function useSidebarNavigation(options: UseSidebarNavigationOptions = {}): UseSidebarNavigationResult {
	const pathname = usePathname();
	const { isAppAdmin, onLogout, settingsRender } = options;

	// Get entity IDs and level from URL params (source of truth)
	const { orgId, databaseId, level } = useEntityParams();

	// Create the route active checker
	const checkRouteActive = useMemo(
		() => (routeKey: string) => isRouteActive(pathname, routeKey as AppRouteKey),
		[pathname]
	);

	// Build the navigation configuration
	const navigation = useMemo(() => {
		const configOptions: SidebarConfigOptions = {
			pathname,
			isAppAdmin,
			onLogout,
			settingsRender,
			activeOrgId: orgId ?? undefined,
			activeDatabaseId: databaseId ?? undefined,
			isRouteActive: checkRouteActive,
		};

		return getSidebarConfig(level, configOptions);
	}, [level, pathname, isAppAdmin, onLogout, settingsRender, orgId, databaseId, checkRouteActive]);

	return {
		level,
		navigation,
		activeOrgId: orgId,
		activeDatabaseId: databaseId,
	};
}
