import {
	getDefaultEndpoint,
	getEndpoints,
	getDbName,
	getAdminEndpoint,
	getAuthEndpoint,
	getAppEndpoint,
	type SchemaContext,
} from '@/lib/runtime/config-core';
import { getRuntimeConfig } from '@/lib/runtime/get-runtime-config';
import { createLogger } from '@/lib/logger';
import { useAppStore } from '@/store/app-store';
import type { AppState } from '@/store/app-store';

export type { SchemaContext } from '@/lib/runtime/config-core';
export { getDbName, getAdminEndpoint, getAuthEndpoint, getAppEndpoint };

const logger = createLogger({ scope: 'app-config' });

/**
 * Get the effective GraphQL endpoint for a context.
 *
 * Priority chain:
 * 1. UI override (from store/localStorage)
 * 2. Dynamic default (getDefaultEndpoint - reads from runtime config or env)
 */
export function getEndpoint(ctx: SchemaContext = 'admin'): string {
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

/**
 * Get the FRONTEND app origin (Next.js dev server), e.g.
 * http://localhost:3000
 *
 * When the GraphQL endpoints are absolute URLs (per-DB hosts), uses the auth
 * endpoint's hostname with the port the app is actually served on. When they
 * are same-origin relative paths (the SSO BFF proxy), the app origin is simply
 * the current window's origin.
 */
export function getAppOrigin(): string {
	const authEndpoint = getEndpoint('auth');
	const port = typeof window !== 'undefined' ? window.location.port : '3000';
	// Relative endpoint (BFF proxy) — the app serves everything on its own origin.
	if (authEndpoint.startsWith('/')) {
		if (typeof window !== 'undefined') return window.location.origin;
		return `http://localhost:${port}`;
	}
	const authUrl = new URL(authEndpoint);
	return `${authUrl.protocol}//${authUrl.hostname}:${port}`;
}

/**
 * The auth lane's origin — absolute when the auth endpoint is an absolute
 * per-tenant URL, the app's own origin when it is the same-origin BFF proxy
 * (a relative path has no origin of its own, and `new URL()` on one throws).
 */
export function getAuthOrigin(): string {
	const endpoint = getEndpoint('auth');
	if (endpoint.startsWith('/')) {
		return typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
	}
	return new URL(endpoint).origin;
}

/** All contexts share the same home path in per-DB mode. */
export const HOME_PATH = '/';

/**
 * The compute sync gateway origin — where the mantra auth pages and the OAuth
 * start lane live (http://localhost by default; Traefik port 80).
 *
 * Client-safe: reads through the runtime-config allowlist (NEXT_PUBLIC_*), so
 * the value is inlined into the client bundle at build time. Do NOT read
 * SSO_GATEWAY_URL from lib/sso/gateway in a client component — that const is
 * server-only and silently degrades to its default in a client bundle.
 */
export function getSSOGatewayOrigin(): string {
	const origin = getRuntimeConfig('NEXT_PUBLIC_SSO_GATEWAY_URL', 'http://localhost');
	return (origin ?? 'http://localhost').replace(/\/$/, '');
}

export function getHomePath(_ctx?: SchemaContext): string {
	return HOME_PATH;
}

// Backward-compatible appConfig container
export const appConfig = {
	get endpoints() {
		return getEndpoints();
	},
} as const;
