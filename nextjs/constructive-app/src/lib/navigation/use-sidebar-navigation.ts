'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';

import { isRouteActive, type AppRouteKey } from '@/app-routes';
import type { NavGroup } from '@/components/app-shell/app-shell.types';

import { getSidebarConfig, type NavigationLevel, type SidebarConfigOptions } from './sidebar-config';
import { useEntityParams } from './use-entity-params';

export interface UseSidebarNavigationOptions {
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
}

/**
 * Hook to build the sidebar navigation for the current URL.
 *
 * Base tier sits at the app root (Home + Account). B2B apps reintroduce an
 * org level here alongside the registry org blocks — see docs/B2B.md.
 */
export function useSidebarNavigation(options: UseSidebarNavigationOptions = {}): UseSidebarNavigationResult {
	const pathname = usePathname();
	const { onLogout, settingsRender } = options;

	const { level } = useEntityParams();

	// Create the route active checker
	const checkRouteActive = useMemo(
		() => (routeKey: string) => isRouteActive(pathname, routeKey as AppRouteKey),
		[pathname]
	);

	// Build the navigation configuration
	const navigation = useMemo(() => {
		const configOptions: SidebarConfigOptions = {
			pathname,
			onLogout,
			settingsRender,
			isRouteActive: checkRouteActive,
		};

		return getSidebarConfig(level, configOptions);
	}, [level, pathname, onLogout, settingsRender, checkRouteActive]);

	return {
		level,
		navigation,
	};
}
