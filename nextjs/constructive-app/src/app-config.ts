import {
	getDefaultEndpoint,
	getEndpoints,
	getSchemaContext as coreGetCtx,
	setSchemaContext as coreSetCtx,
	getDbName,
	getAdminEndpoint,
	getAuthEndpoint,
	getAppEndpoint,
	type SchemaContext,
} from '@/lib/runtime/config-core';
import { createLogger } from '@/lib/logger';
import { useAppStore } from '@/store/app-store';
import type { AppState } from '@/store/app-store';

export type { SchemaContext } from '@/lib/runtime/config-core';
export { getDbName, getAdminEndpoint, getAuthEndpoint, getAppEndpoint };

export const setSchemaContext = coreSetCtx;
export const getSchemaContext = coreGetCtx;

const logger = createLogger({ scope: 'app-config' });

/**
 * Get the effective GraphQL endpoint for a context.
 *
 * Priority chain:
 * 1. UI override (from store/localStorage)
 * 2. Dynamic default (getDefaultEndpoint - reads from runtime config or env)
 */
export function getEndpoint(ctx: SchemaContext = getSchemaContext()): string {
	let endpoint: string | null = null;
	let source = 'none';

	// 1. Check UI override (store)
	try {
		const state: AppState = useAppStore.getState();
		const o = state.env.endpointOverrides?.[ctx];
		if (o && o.trim().length) {
			endpoint = o.trim();
			source = 'ui-override';
		}
	} catch (e) {
		logger.debug('getEndpoint: Error accessing store', { error: String(e) });
	}

	// 2. Use dynamic getter
	if (!endpoint) {
		endpoint = getDefaultEndpoint(ctx);
		source = 'getDefaultEndpoint';
	}

	logger.debug('getEndpoint called', { context: ctx, endpoint, source });

	return endpoint;
}

export { getDefaultEndpoint };

export const homePathByContext: Record<SchemaContext, string> = {
	admin: '/',
	auth: '/',
	app: '/',
} as const;

export function getHomePath(ctx: SchemaContext = getSchemaContext()): string {
	return homePathByContext[ctx];
}

// Backward-compatible appConfig container
export const appConfig = {
	get endpoints() {
		return getEndpoints();
	},
} as const;
