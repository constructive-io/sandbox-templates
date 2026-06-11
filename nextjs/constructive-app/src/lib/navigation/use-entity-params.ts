/**
 * Entity Params Hook — URL-based navigation level (BASE tier)
 *
 * The base auth:email app has a single navigation level: the app root. There
 * is no organization hierarchy, so this hook is intentionally minimal.
 *
 * B2B OPT-IN: a b2b app re-introduces the org level (an `orgId` path param,
 * an org switcher, `/orgs/[orgId]/*` routes) alongside the registry org blocks.
 * See docs/B2B.md.
 */
'use client';

/**
 * Navigation level based on URL path params.
 * Base tier only ever sits at the app root.
 */
export type NavigationLevel = 'root';

/**
 * Result from useEntityParams hook.
 */
export interface UseEntityParamsResult {
	/** Navigation level derived from the URL (always 'root' in the base tier). */
	level: NavigationLevel;
	/** Whether navigation context is still loading. */
	isLoading: boolean;
}

/**
 * Hook to read the current navigation level.
 *
 * In the base tier this is constant (`root`); it exists as a stable seam so a
 * b2b app can reintroduce org-aware logic without rewiring callers.
 */
export function useEntityParams(): UseEntityParamsResult {
	return {
		level: 'root',
		isLoading: false,
	};
}
