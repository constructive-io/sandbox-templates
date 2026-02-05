import type { DirectConnectConfig, SchemaContext } from './config-core';

/**
 * Pure helper functions for Direct Connect logic.
 *
 * These functions are intentionally pure (no side effects, no store imports)
 * to avoid circular imports and make testing easier.
 *
 * Usage:
 * - Import these in execute.ts, route-guards.tsx, auth-context.tsx
 * - Pass the directConnect state from the store as a parameter
 */

/**
 * Check if Direct Connect is enabled for a given context.
 *
 * @param ctx - The schema context to check
 * @param directConnect - The Direct Connect state from the store
 * @returns true if Direct Connect is enabled
 */
export function isDirectConnectEnabled(
	ctx: SchemaContext,
	directConnect: Record<SchemaContext, DirectConnectConfig>,
): boolean {
	const config = directConnect[ctx];
	return config?.enabled ?? false;
}

/**
 * Check if authentication should be bypassed for a given context.
 *
 * Returns true if Direct Connect is enabled AND skipAuth is true.
 * This allows using Direct Connect with custom endpoints while still using auth.
 *
 * @param ctx - The schema context to check
 * @param directConnect - The Direct Connect state from the store
 * @returns true if auth should be bypassed
 */
export function shouldBypassAuth(
	ctx: SchemaContext,
	directConnect: Record<SchemaContext, DirectConnectConfig>,
): boolean {
	const config = directConnect[ctx];
	return Boolean(config?.enabled && config?.skipAuth === true);
}

/**
 * Get the Direct Connect endpoint override for a context.
 *
 * Returns the custom endpoint URL if Direct Connect is enabled and an endpoint is set.
 * Returns null otherwise, indicating the normal endpoint should be used.
 *
 * @param ctx - The schema context to check
 * @param directConnect - The Direct Connect state from the store
 * @returns The custom endpoint URL or null
 */
export function getDirectConnectEndpoint(
	ctx: SchemaContext,
	directConnect: Record<SchemaContext, DirectConnectConfig>,
): string | null {
	const config = directConnect[ctx];
	if (!config?.enabled) return null;
	return config.endpoint;
}

/**
 * Validate a URL for use as a GraphQL endpoint.
 *
 * Checks that the URL:
 * - Is not empty
 * - Is a valid URL format
 * - Uses http or https protocol
 *
 * @param url - The URL string to validate
 * @returns An error message if invalid, null if valid
 */
export function validateEndpointUrl(url: string): string | null {
	const trimmed = url.trim();

	if (!trimmed) {
		return 'Endpoint URL is required';
	}

	try {
		const parsed = new URL(trimmed);
		if (!['http:', 'https:'].includes(parsed.protocol)) {
			return 'URL must use http or https protocol';
		}
		return null;
	} catch {
		return 'Invalid URL format';
	}
}

/**
 * Check if a context supports Direct Connect.
 *
 * Currently only 'dashboard' supports Direct Connect.
 * Schema-builder requires authentication for managing schemas.
 *
 * @param ctx - The schema context to check
 * @returns true if the context supports Direct Connect
 */
export function isDirectConnectSupported(ctx: SchemaContext): boolean {
	// Currently only dashboard supports Direct Connect
	// Schema-builder requires authentication for managing schemas
	return ctx === 'dashboard';
}

/**
 * Create a DirectConnectConfig object with validation.
 *
 * This is a helper to ensure consistent config creation.
 *
 * @param enabled - Whether Direct Connect should be enabled
 * @param endpoint - The custom endpoint URL (required when enabled)
 * @param skipAuth - Whether to skip authentication (default: true)
 * @returns A validated DirectConnectConfig object
 */
export function createDirectConnectConfig(
	enabled: boolean,
	endpoint?: string | null,
	skipAuth: boolean = true,
): DirectConnectConfig {
	return {
		enabled,
		endpoint: enabled && endpoint?.trim() ? endpoint.trim() : null,
		skipAuth: enabled ? skipAuth : true, // Default to true when disabled
	};
}
