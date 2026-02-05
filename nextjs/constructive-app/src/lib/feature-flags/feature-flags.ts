/**
 * Feature Flags System
 *
 * Provides a centralized way to control feature availability based on environment.
 * Compatible with Next.js - uses process.env.NODE_ENV which is inlined at build time.
 *
 * Usage:
 * ```ts
 * import { isFeatureEnabled, FeatureFlag } from '@/lib/feature-flags';
 *
 * // Check programmatically
 * if (isFeatureEnabled('devMode')) {
 *   // Show dev mode UI
 * }
 * ```
 */

/**
 * Available feature flags in the application.
 * Add new flags here as the application grows.
 */
export type FeatureFlagName = 'devMode' | 'directConnect' | 'debugPanel' | 'experimentalFeatures';

/**
 * Feature flag configuration.
 */
export interface FeatureFlagConfig {
	/** Whether the feature is enabled in development (NODE_ENV === 'development') */
	enabledInDev: boolean;
	/** Whether the feature is enabled in production (NODE_ENV === 'production') */
	enabledInProd: boolean;
	/** Whether the feature is enabled in test (NODE_ENV === 'test') */
	enabledInTest: boolean;
	/** Optional description for documentation */
	description?: string;
}

/**
 * Feature flag definitions.
 * Configure which features are available in which environments.
 */
const featureFlags: Record<FeatureFlagName, FeatureFlagConfig> = {
	/**
	 * Dev Mode - Developer-only controls surfaced in UI
	 * Only available in development.
	 */
	devMode: {
		enabledInDev: true,
		enabledInProd: false,
		enabledInTest: false,
		description: 'Developer-only UI controls (e.g., endpoint overrides)'
	},

	/**
	 * Direct Connect - Allows connecting to custom GraphQL endpoints for the dashboard
	 * Only available in development environment for security reasons.
	 */
	directConnect: {
		enabledInDev: true,
		enabledInProd: false,
		enabledInTest: true,
		description: 'Dashboard Direct Connect - connect to custom GraphQL endpoints with optional auth bypass',
	},

	/**
	 * Debug Panel - Shows debugging information
	 * Only available in development.
	 */
	debugPanel: {
		enabledInDev: true,
		enabledInProd: false,
		enabledInTest: false,
		description: 'Shows debugging information and tools',
	},

	/**
	 * Experimental Features - Unstable features under development
	 * Only available in development.
	 */
	experimentalFeatures: {
		enabledInDev: true,
		enabledInProd: false,
		enabledInTest: false,
		description: 'Enables experimental features that are still under development',
	},
};

/**
 * Get the current environment.
 * Uses process.env.NODE_ENV which is inlined at build time by Next.js.
 */
export function getEnvironment(): 'development' | 'production' | 'test' {
	// NODE_ENV is inlined at build time by Next.js/webpack
	// This is safe to use and will be replaced with the actual value
	const env = process.env.NODE_ENV;

	if (env === 'development') return 'development';
	if (env === 'test') return 'test';
	return 'production';
}

/**
 * Check if the current environment is development.
 */
export function isDevelopment(): boolean {
	return getEnvironment() === 'development';
}

/**
 * Check if the current environment is production.
 */
export function isProduction(): boolean {
	return getEnvironment() === 'production';
}

/**
 * Check if the current environment is test.
 */
export function isTest(): boolean {
	return getEnvironment() === 'test';
}

/**
 * Check if a feature flag is enabled in the current environment.
 *
 * @param flagName - The name of the feature flag to check
 * @returns Whether the feature is enabled
 *
 * @example
 * ```ts
 * if (isFeatureEnabled('devMode')) {
 *   // Render dev mode UI
 * }
 * ```
 */
export function isFeatureEnabled(flagName: FeatureFlagName): boolean {
	const config = featureFlags[flagName];

	if (!config) {
		// Unknown flag - default to disabled for safety
		if (isDevelopment()) {
			console.warn(`[feature-flags] Unknown feature flag: ${flagName}`);
		}
		return false;
	}

	const env = getEnvironment();

	switch (env) {
		case 'development':
			return config.enabledInDev;
		case 'test':
			return config.enabledInTest;
		case 'production':
		default:
			return config.enabledInProd;
	}
}

/**
 * Get the configuration for a feature flag.
 *
 * @param flagName - The name of the feature flag
 * @returns The feature flag configuration or undefined if not found
 */
export function getFeatureFlagConfig(flagName: FeatureFlagName): FeatureFlagConfig | undefined {
	return featureFlags[flagName];
}

/**
 * Get all feature flags and their current enabled status.
 * Useful for debugging.
 */
export function getAllFeatureFlags(): Record<FeatureFlagName, boolean> {
	const flags = Object.keys(featureFlags) as FeatureFlagName[];
	return flags.reduce(
		(acc, flag) => {
			acc[flag] = isFeatureEnabled(flag);
			return acc;
		},
		{} as Record<FeatureFlagName, boolean>,
	);
}
