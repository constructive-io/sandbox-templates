import type { Route } from 'next';
import { parseAsString } from 'nuqs';

import type { SchemaContext } from '@/lib/runtime/config-core';

/**
 * Route access types for authentication:
 * - 'public': No auth required, renders immediately (auth may be handled by embedded AuthGate)
 * - 'protected': Requires authentication - redirects to root (/) if not authenticated
 * - 'guest-only': Only accessible when NOT authenticated (login, register pages)
 * - 'redirect': Immediately redirects to another route
 */
export type RouteAccessType = 'public' | 'protected' | 'guest-only' | 'redirect';

/**
 * Required permission types for routes
 * - 'app-admin': Requires app_memberships.is_admin = true
 */
export type RequiredPermission = 'app-admin';

/**
 * Route configuration with auth requirements.
 * Adding a new route? Just add an entry here with proper access/context config.
 */
export interface RouteConfig {
	path: Route;
	searchParams: Record<string, unknown>;
	/** Access type for this route. Defaults to 'public' if not specified. */
	access?: RouteAccessType;
	/** For 'redirect' access type, where to redirect */
	redirectTo?: Route;
	/** Which auth context this route belongs to. Used for token selection. */
	context?: SchemaContext;
	/** Required permission for this route. If set, user must have this permission. */
	requiredPermission?: RequiredPermission;
}

// =============================================================================
// ROUTE CONFIGURATION - Single source of truth for all routes (BASE tier)
// =============================================================================
// The base auth:email app has a single navigation level: the app root, plus
// the auth + account surfaces. Organization-scoped routes (/orgs/[orgId]/*,
// /organizations) and the app-admin routes (/users, /invites, /settings) are a
// b2b opt-in delivered with the registry org blocks — see docs/B2B.md. The
// `requiredPermission: 'app-admin'` gate (RouteGuard) still exists for b2b apps
// to reuse, but no base route uses it.
// =============================================================================

export const APP_ROUTES = {
	// Root route - entry point
	// When unauthenticated: shows login screen
	// When authenticated: shows build guide (edit this page!)
	ROOT: {
		path: '/' as Route,
		searchParams: {},
		access: 'public' as RouteAccessType,
		context: 'admin' as SchemaContext,
	},

	// ==========================================================================
	// ACCOUNT ROUTES - User account management
	// ==========================================================================
	ACCOUNT_SETTINGS: {
		path: '/account/settings' as Route,
		searchParams: {
			tab: parseAsString.withDefault('general'),
		},
		access: 'protected' as RouteAccessType,
		context: 'admin' as SchemaContext,
	},

	// ==========================================================================
	// GUEST-ONLY ROUTES - Only accessible when NOT authenticated
	// ==========================================================================
	LOGIN: {
		path: '/login' as Route,
		searchParams: { redirect: parseAsString },
		access: 'guest-only' as RouteAccessType,
	},

	REGISTER: {
		path: '/register' as Route,
		searchParams: { redirect: parseAsString },
		access: 'guest-only' as RouteAccessType,
	},

	FORGOT_PASSWORD: {
		path: '/forgot-password' as Route,
		searchParams: {},
		access: 'guest-only' as RouteAccessType,
	},

	RESET_PASSWORD: {
		path: '/reset-password' as Route,
		searchParams: { token: parseAsString },
		access: 'guest-only' as RouteAccessType,
	},

	CHECK_EMAIL: {
		path: '/check-email' as Route,
		searchParams: { type: parseAsString, email: parseAsString },
		access: 'public' as RouteAccessType,
	},

	VERIFY_EMAIL: {
		path: '/verify-email' as Route,
		searchParams: {
			verification_token: parseAsString,
			email_id: parseAsString,
		},
		access: 'public' as RouteAccessType,
	},
} as const;

// Extract route keys for type safety
export type AppRouteKey = keyof typeof APP_ROUTES;

// Extract route paths
export type AppRoutePath = (typeof APP_ROUTES)[AppRouteKey]['path'];

// Utility type to get search params for a specific route
export type RouteSearchParams<TRoute extends AppRouteKey> = (typeof APP_ROUTES)[TRoute]['searchParams'];

// Helper function to build route URLs with search params
export function buildRoute<TRoute extends AppRouteKey>(
	routeKey: TRoute,
	searchParams?: Partial<Record<keyof RouteSearchParams<TRoute>, string | string[] | number | boolean | null>>,
): string {
	const route = APP_ROUTES[routeKey];
	const url = new URL(route.path, 'http://localhost'); // Base URL doesn't matter for pathname

	if (searchParams) {
		Object.entries(searchParams).forEach(([key, value]) => {
			if (value !== null && value !== undefined) {
				if (Array.isArray(value)) {
					value.forEach((v) => url.searchParams.append(key, String(v)));
				} else {
					url.searchParams.set(key, String(value));
				}
			}
		});
	}

	return url.pathname + url.search;
}

// Cache for compiled route patterns - avoids recreating RegExp on every call
const routePatternCache = new Map<string, { exact: RegExp; prefix: RegExp }>();

function getRoutePatterns(routePath: string): { exact: RegExp; prefix: RegExp } {
	let cached = routePatternCache.get(routePath);
	if (!cached) {
		const routePattern = routePath.replace(/\[([^\]]+)\]/g, '[^/]+');
		cached = {
			exact: new RegExp(`^${routePattern}$`),
			prefix: new RegExp(`^${routePattern}/`),
		};
		routePatternCache.set(routePath, cached);
	}
	return cached;
}

// Helper function to check if a path matches a route
export function isRouteActive(currentPath: string, routeKey: AppRouteKey): boolean {
	const route = APP_ROUTES[routeKey];

	// Remove query parameters and hash from current path for comparison
	const pathname = currentPath.split('?')[0].split('#')[0];

	// Root path
	if (pathname === '/' || pathname === '') {
		return routeKey === 'ROOT';
	}

	// Use cached patterns
	const { exact, prefix } = getRoutePatterns(route.path);
	return exact.test(pathname) || prefix.test(pathname);
}

// Helper function to get route key from path
export function getRouteKeyFromPath(path: string): AppRouteKey | null {
	// Remove query parameters for matching
	const pathname = path.split('?')[0];

	// Find exact match first
	for (const [key, route] of Object.entries(APP_ROUTES)) {
		if (route.path === pathname) {
			return key as AppRouteKey;
		}
	}

	// Then find partial matches (for nested routes)
	for (const [key, route] of Object.entries(APP_ROUTES)) {
		if (route.path !== '/' && pathname.startsWith(route.path + '/')) {
			return key as AppRouteKey;
		}
	}

	// Root path
	if (pathname === '/' || pathname === '') {
		return 'ROOT';
	}

	return null;
}

// =============================================================================
// ROUTE ACCESS HELPERS - Used by RouteGuard for authentication decisions
// =============================================================================

/**
 * Get the route configuration for a given pathname.
 * Returns the matching route config or null if not found.
 */
export function getRouteConfig(pathname: string): (typeof APP_ROUTES)[AppRouteKey] | null {
	const routeKey = getRouteKeyFromPath(pathname);
	if (!routeKey) return null;
	return APP_ROUTES[routeKey];
}

/**
 * Get the access type for a given pathname.
 * Returns the access type from route config, defaults to 'public' if not specified.
 */
export function getRouteAccessType(pathname: string): RouteAccessType {
	const config = getRouteConfig(pathname);
	return (config?.access as RouteAccessType) ?? 'public';
}

/**
 * Get the redirect target for a route, if it's a redirect route.
 */
export function getRouteRedirectTarget(pathname: string): Route | null {
	const config = getRouteConfig(pathname);
	if (config?.access === 'redirect' && 'redirectTo' in config) {
		return config.redirectTo as Route;
	}
	return null;
}

/**
 * Get the auth context for a given pathname.
 * Returns the context from route config, or infers from pathname as fallback.
 */
export function getRouteContext(pathname: string): SchemaContext {
	const config = getRouteConfig(pathname);
	if (config && 'context' in config && config.context) {
		return config.context;
	}
	return 'admin';
}

/**
 * Check if a route is protected (requires authentication).
 * Protected routes redirect to root (/) when user is not authenticated.
 */
export function isProtectedRoute(pathname: string): boolean {
	return getRouteAccessType(pathname) === 'protected';
}

/**
 * Get the required permission for a route, if any.
 * Returns the permission from route config, or null if no permission is required.
 */
export function getRouteRequiredPermission(pathname: string): RequiredPermission | null {
	const config = getRouteConfig(pathname);
	// No BASE route declares `requiredPermission`, so the inferred config union
	// has no such member; b2b routes (see docs/B2B.md) reintroduce it. Read it
	// defensively via an index lookup so the helper stays valid for both tiers.
	const required = (config as Record<string, unknown> | null)?.requiredPermission;
	if (required) {
		return required as RequiredPermission;
	}
	return null;
}

/**
 * Check if a route requires app admin permission.
 */
export function isAppAdminRoute(pathname: string): boolean {
	return getRouteRequiredPermission(pathname) === 'app-admin';
}

// Navigation utilities
export const navigationUtils = {
	buildRoute,
	isRouteActive,
	getRouteKeyFromPath,

	// Get all available routes
	getAllRoutes: () => Object.keys(APP_ROUTES) as AppRouteKey[],

	// Get route config by key
	getRoute: <TRoute extends AppRouteKey>(routeKey: TRoute) => APP_ROUTES[routeKey],

	// Check if route exists
	hasRoute: (routeKey: string): routeKey is AppRouteKey => {
		return routeKey in APP_ROUTES;
	},
};

// Export route constants for easy access
export const ROUTE_PATHS = {
	ROOT: APP_ROUTES.ROOT.path,
	// Account routes
	ACCOUNT_SETTINGS: APP_ROUTES.ACCOUNT_SETTINGS.path,
	// Guest-only routes
	LOGIN: APP_ROUTES.LOGIN.path,
	REGISTER: APP_ROUTES.REGISTER.path,
	FORGOT_PASSWORD: APP_ROUTES.FORGOT_PASSWORD.path,
	RESET_PASSWORD: APP_ROUTES.RESET_PASSWORD.path,
	CHECK_EMAIL: APP_ROUTES.CHECK_EMAIL.path,
	VERIFY_EMAIL: APP_ROUTES.VERIFY_EMAIL.path,
} as const;
