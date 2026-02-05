import {
	appEndpoints,
	getDefaultEndpoint,
	getSchemaBuilderSubEndpoint,
	getSchemaContext as coreGetCtx,
	setSchemaContext as coreSetCtx,
	type SchemaBuilderSubEndpoint,
	type SchemaContext,
} from '@/lib/runtime/config-core';
import { createLogger } from '@/lib/logger';
import { useAppStore } from '@/store/app-store';
import type { AppState } from '@/store/app-store';

export { detectSchemaContextFromPath } from '@/lib/runtime/config-core';
export type { SchemaBuilderSubEndpoint, SchemaContext } from '@/lib/runtime/config-core';

export const setSchemaContext = coreSetCtx;
export const getSchemaContext = coreGetCtx;

const logger = createLogger({ scope: 'app-config' });

/**
 * Get the effective GraphQL endpoint for a context.
 *
 * Priority chain:
 * 1. UI override (from store/localStorage)
 * 2. Dynamic default (getDefaultEndpoint - reads from runtime config or env)
 * 3. Static fallback (appEndpoints - evaluated at module load)
 *
 * For schema-builder: Returns the configured endpoint.
 * For dashboard: Returns the endpoint override (from database API selection)
 *                or null if no endpoint is configured.
 *
 * Note: Dashboard endpoint must be set via database API selection or Direct Connect.
 * The dashboard context has no default endpoint.
 */
export function getEndpoint(ctx: SchemaContext = getSchemaContext()): string | null {
	let endpoint: string | null = null;
	let source = 'none';

	// 1. Check UI override (store)
	try {
		const state: AppState = useAppStore.getState();
		const o = state.endpointOverrides?.[ctx];
		if (o && o.trim().length) {
			endpoint = o.trim();
			source = 'ui-override';
		}
	} catch (e) {
		logger.debug('getEndpoint: Error accessing store', { error: String(e) });
	}

	// 2. Use dynamic getter (reads from window.__RUNTIME_CONFIG__ or process.env)
	if (!endpoint) {
		endpoint = getDefaultEndpoint(ctx);
		if (endpoint) {
			source = 'getDefaultEndpoint';
		}
	}

	// 3. Fallback to static appEndpoints (for backwards compat)
	if (!endpoint) {
		endpoint = appEndpoints[ctx];
		if (endpoint) {
			source = 'appEndpoints-fallback';
		}
	}

	logger.debug('getEndpoint called', {
		context: ctx,
		endpoint,
		source,
		appEndpointsValue: appEndpoints[ctx],
	});

	return endpoint;
}

/**
 * Get the effective endpoint for a schema-builder sub-endpoint.
 *
 * When the schema-builder UI override is set, ALL sub-endpoints use that override
 * (user is pointing at a different server where a single endpoint exposes everything).
 * Otherwise falls back to per-sub-endpoint resolution (runtime config → env → default).
 */
export function getSubEndpoint(sub: SchemaBuilderSubEndpoint): string {
	// If schema-builder has a UI override, use it for all sub-endpoints
	try {
		const state: AppState = useAppStore.getState();
		const o = state.endpointOverrides?.['schema-builder'];
		if (o && o.trim().length) {
			return o.trim();
		}
	} catch {
		// Store not available yet
	}

	return getSchemaBuilderSubEndpoint(sub);
}

export const homePathByContext: Record<SchemaContext, string> = {
	'schema-builder': '/',
	dashboard: '/',
} as const;

export function getHomePath(ctx: SchemaContext = getSchemaContext()): string {
	return homePathByContext[ctx];
}

// Backward-compatible appConfig container
export const appConfig = {
	endpoints: appEndpoints,
} as const;
