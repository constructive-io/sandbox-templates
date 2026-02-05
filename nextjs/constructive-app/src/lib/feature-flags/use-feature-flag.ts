'use client';

import { useMemo } from 'react';

import { type FeatureFlagName, isFeatureEnabled } from './feature-flags';

/**
 * React hook to check if a feature flag is enabled.
 *
 * This hook provides a reactive way to check feature flags in React components.
 * The value is memoized since feature flags don't change during runtime
 * (they're determined at build time via NODE_ENV).
 *
 * @param flagName - The name of the feature flag to check
 * @returns Whether the feature is enabled
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const isDirectConnectAvailable = useFeatureFlag('directConnect');
 *
 *   if (!isDirectConnectAvailable) {
 *     return null;
 *   }
 *
 *   return <DirectConnectControls />;
 * }
 * ```
 */
export function useFeatureFlag(flagName: FeatureFlagName): boolean {
	// Memoize since NODE_ENV doesn't change during runtime
	return useMemo(() => isFeatureEnabled(flagName), [flagName]);
}

/**
 * React hook to get multiple feature flags at once.
 *
 * @param flagNames - Array of feature flag names to check
 * @returns Object mapping flag names to their enabled status
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const flags = useFeatureFlags(['directConnect', 'debugPanel']);
 *
 *   return (
 *     <>
 *       {flags.directConnect && <DirectConnectControls />}
 *       {flags.debugPanel && <DebugPanel />}
 *     </>
 *   );
 * }
 * ```
 */
export function useFeatureFlags<T extends FeatureFlagName>(flagNames: T[]): Record<T, boolean> {
	return useMemo(() => {
		return flagNames.reduce(
			(acc, flag) => {
				acc[flag] = isFeatureEnabled(flag);
				return acc;
			},
			{} as Record<T, boolean>,
		);
	}, [flagNames]);
}
