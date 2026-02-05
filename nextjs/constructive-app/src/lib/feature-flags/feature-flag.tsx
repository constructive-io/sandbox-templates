'use client';

import type { ReactNode } from 'react';

import { type FeatureFlagName, isFeatureEnabled } from './feature-flags';

interface FeatureFlagProps {
	/**
	 * The name of the feature flag to check.
	 */
	flag: FeatureFlagName;
	/**
	 * Content to render when the feature flag is enabled.
	 */
	children: ReactNode;
	/**
	 * Optional content to render when the feature flag is disabled.
	 * If not provided, nothing is rendered when disabled.
	 */
	fallback?: ReactNode;
}

/**
 * Component that conditionally renders children based on a feature flag.
 *
 * This is a declarative way to show/hide features based on environment.
 * The feature flag check happens at render time and is based on NODE_ENV.
 *
 * @example
 * ```tsx
 * // Basic usage - only show in development
 * <FeatureFlag flag="directConnect">
 *   <DirectConnectControls />
 * </FeatureFlag>
 *
 * // With fallback for production
 * <FeatureFlag flag="experimentalFeatures" fallback={<StableFeature />}>
 *   <ExperimentalFeature />
 * </FeatureFlag>
 * ```
 */
export function FeatureFlag({ flag, children, fallback = null }: FeatureFlagProps) {
	const isEnabled = isFeatureEnabled(flag);

	if (!isEnabled) {
		return <>{fallback}</>;
	}

	return <>{children}</>;
}

interface MultiFeatureFlagProps {
	/**
	 * Array of feature flags - ALL must be enabled for children to render.
	 */
	flags: FeatureFlagName[];
	/**
	 * Content to render when all feature flags are enabled.
	 */
	children: ReactNode;
	/**
	 * Optional content to render when any feature flag is disabled.
	 */
	fallback?: ReactNode;
}

/**
 * Component that conditionally renders children when ALL specified feature flags are enabled.
 *
 * @example
 * ```tsx
 * <MultiFeatureFlag flags={['directConnect', 'experimentalFeatures']}>
 *   <ExperimentalDevFeature />
 * </MultiFeatureFlag>
 * ```
 */
export function MultiFeatureFlag({ flags, children, fallback = null }: MultiFeatureFlagProps) {
	const allEnabled = flags.every((flag) => isFeatureEnabled(flag));

	if (!allEnabled) {
		return <>{fallback}</>;
	}

	return <>{children}</>;
}

interface AnyFeatureFlagProps {
	/**
	 * Array of feature flags - ANY one must be enabled for children to render.
	 */
	flags: FeatureFlagName[];
	/**
	 * Content to render when at least one feature flag is enabled.
	 */
	children: ReactNode;
	/**
	 * Optional content to render when all feature flags are disabled.
	 */
	fallback?: ReactNode;
}

/**
 * Component that conditionally renders children when ANY of the specified feature flags are enabled.
 *
 * @example
 * ```tsx
 * <AnyFeatureFlag flags={['directConnect', 'debugPanel']}>
 *   <DeveloperTools />
 * </AnyFeatureFlag>
 * ```
 */
export function AnyFeatureFlag({ flags, children, fallback = null }: AnyFeatureFlagProps) {
	const anyEnabled = flags.some((flag) => isFeatureEnabled(flag));

	if (!anyEnabled) {
		return <>{fallback}</>;
	}

	return <>{children}</>;
}
