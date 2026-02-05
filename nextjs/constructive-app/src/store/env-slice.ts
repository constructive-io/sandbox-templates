import { StateCreator } from 'zustand';

import { TokenManager } from '@/lib/auth/token-manager';
import { createLogger } from '@/lib/logger';
import { queryClient } from '@/lib/query-client';
import type { DirectConnectConfig, SchemaContext } from '@/lib/runtime/config-core';
import { DEFAULT_DIRECT_CONNECT, getDefaultEndpoint, schemaContexts } from '@/lib/runtime/config-core';
import { isDirectConnectSupported } from '@/lib/runtime/direct-connect';

import type { AuthSlice } from './auth-slice';

export interface EnvState {
	endpointOverrides: Record<SchemaContext, string | null>;
	/**
	 * Per-context Direct Connect configuration.
	 * When enabled for a context, a custom endpoint is used with optional auth bypass.
	 * Currently only 'dashboard' supports Direct Connect.
	 *
	 * Note: Direct Connect state is intentionally NOT persisted - it resets on page refresh.
	 */
	directConnect: Record<SchemaContext, DirectConnectConfig>;
}

export interface EnvActions {
	setEndpointOverride: (ctx: SchemaContext, url: string | null) => void;
	// Internal: update state from storage sync without writing localStorage again
	setEndpointOverrideFromSync?: (ctx: SchemaContext, url: string | null) => void;
	clearEndpointOverride: (ctx: SchemaContext) => void;
	resetEndpointOverrides: () => void;
	getEffectiveEndpoint: (ctx: SchemaContext) => string | null;

	// Direct Connect actions
	/**
	 * Enable or disable Direct Connect for a context.
	 * When enabled, the custom endpoint is used. Auth can be optionally bypassed via skipAuth.
	 * Currently only 'dashboard' supports Direct Connect.
	 */
	setDirectConnect: (ctx: SchemaContext, config: DirectConnectConfig) => void;
	/** Reset Direct Connect to disabled for a context. */
	clearDirectConnect: (ctx: SchemaContext) => void;
	/** Check if Direct Connect is enabled for a context. */
	isDirectConnectEnabled: (ctx: SchemaContext) => boolean;
	/** Get the Direct Connect endpoint for a context, or null if disabled or no endpoint is set. */
	getDirectConnectEndpoint: (ctx: SchemaContext) => string | null;
	/** Check if auth should be bypassed for a context (Direct Connect enabled with skipAuth=true). */
	shouldBypassAuth: (ctx: SchemaContext) => boolean;
}

export type EnvSlice = EnvState & EnvActions;

const authLogger = createLogger({ scope: 'auth', includeTimestamp: false });
const directConnectLogger = createLogger({ scope: 'direct-connect', includeTimestamp: false });

const STORAGE_KEY = (ctx: SchemaContext) => `constructive-endpoint:${ctx}`;

function readStoredOverride(ctx: SchemaContext): string | null {
	try {
		if (typeof window === 'undefined') return null;
		// Dashboard context is dynamic and should not be persisted/restored
		if (ctx === 'dashboard') return null;
		return localStorage.getItem(STORAGE_KEY(ctx));
	} catch {
		return null;
	}
}

const createEmptyOverrides = (): Record<SchemaContext, null> =>
	Object.fromEntries(schemaContexts.map((ctx) => [ctx, null])) as Record<SchemaContext, null>;

const createInitialDirectConnect = (): Record<SchemaContext, DirectConnectConfig> =>
	Object.fromEntries(schemaContexts.map((ctx) => [ctx, { ...DEFAULT_DIRECT_CONNECT }])) as Record<
		SchemaContext,
		DirectConnectConfig
	>;

const initialEnvState: EnvState = {
	endpointOverrides: createEmptyOverrides(),
	directConnect: createInitialDirectConnect(),
};

export const createEnvSlice: StateCreator<EnvSlice & AuthSlice, [], [], EnvSlice> = (set, get) => {
	const resetAuthForContext = (ctx: SchemaContext, reason: string) => {
		if (ctx === 'dashboard') return;
		authLogger.info(`Resetting auth for ${ctx} due to ${reason}`);

		TokenManager.clearToken(ctx);

		try {
			queryClient.clear();
		} catch {}

		const state = get();
		state.setUnauthenticated(ctx);
		state.setLoading(false, ctx);
	};
	// bootstrap from localStorage if any (non-fatal)
	const bootstrapOverrides = Object.fromEntries(schemaContexts.map((ctx) => [ctx, readStoredOverride(ctx)])) as Partial<
		Record<SchemaContext, string | null>
	>;

	// merge bootstrap into initial
	const state: EnvState = {
		endpointOverrides: {
			...initialEnvState.endpointOverrides,
			...(bootstrapOverrides as Record<SchemaContext, string | null>),
		},
		// Direct Connect is always initialized fresh (not persisted)
		directConnect: createInitialDirectConnect(),
	};

	return {
		...state,
		setEndpointOverride: (ctx, url) => {
			const value = url && url.trim().length ? url.trim() : null;
			// Skip if unchanged
			const current = get().endpointOverrides[ctx];
			const currentValue = current && current.trim().length ? current.trim() : null;

			if (currentValue === value) return;

			set((s) => ({ endpointOverrides: { ...s.endpointOverrides, [ctx]: value } }));
			// reflect to localStorage so other tabs can pick it up
			// Only persist schema-builder overrides; dashboard is dynamic
			try {
				if (typeof window !== 'undefined' && ctx !== 'dashboard') {
					if (value === null) localStorage.removeItem(STORAGE_KEY(ctx));
					else localStorage.setItem(STORAGE_KEY(ctx), value);
				}
			} catch {}

			// Only reset auth if the endpoint ACTUALLY changed to a different destination
			// We've already checked currentValue === value above, so if we are here, it changed.
			resetAuthForContext(ctx, 'endpoint override change');
		},
		setEndpointOverrideFromSync: (ctx, url) => {
			const value = url && url.trim().length ? url.trim() : null;
			const current = get().endpointOverrides[ctx] ?? null;
			if (current === value) return;
			set((s) => ({ endpointOverrides: { ...s.endpointOverrides, [ctx]: value } }));
			resetAuthForContext(ctx, 'endpoint override sync');
		},
		clearEndpointOverride: (ctx) => {
			const current = get().endpointOverrides[ctx] ?? null;
			if (current === null) return;
			set((s) => ({ endpointOverrides: { ...s.endpointOverrides, [ctx]: null } }));
			try {
				if (typeof window !== 'undefined' && ctx !== 'dashboard') localStorage.removeItem(STORAGE_KEY(ctx));
			} catch {}

			resetAuthForContext(ctx, 'endpoint override cleared');
		},
		resetEndpointOverrides: () => {
			const previous = get().endpointOverrides;
			set({ endpointOverrides: createEmptyOverrides() });
			try {
				if (typeof window !== 'undefined') {
					localStorage.removeItem(STORAGE_KEY('dashboard'));
					localStorage.removeItem(STORAGE_KEY('schema-builder'));
				}
			} catch {}

			schemaContexts.forEach((ctx) => {
				if (previous[ctx] !== null) {
					resetAuthForContext(ctx, 'endpoint overrides reset');
				}
			});
		},
		getEffectiveEndpoint: (ctx) => {
			const o = get().endpointOverrides[ctx];
			return o && o.trim().length ? o.trim() : getDefaultEndpoint(ctx);
		},

		// Direct Connect actions
		setDirectConnect: (ctx, config) => {
			// Validate: only supported contexts can use Direct Connect
			if (!isDirectConnectSupported(ctx)) {
				directConnectLogger.warn(`Direct Connect is only supported for dashboard context, not '${ctx}'`);
				return;
			}

			const current = get().directConnect[ctx];

			// Skip if unchanged (deep equality check)
			if (
				current.enabled === config.enabled &&
				current.endpoint === config.endpoint &&
				current.skipAuth === config.skipAuth
			) {
				return;
			}

			// Update state
			set((s) => ({
				directConnect: {
					...s.directConnect,
					[ctx]: {
						enabled: config.enabled,
						endpoint: config.enabled && config.endpoint?.trim() ? config.endpoint.trim() : null,
						skipAuth: config.skipAuth,
					},
				},
			}));

			// Clear query cache when toggling Direct Connect
			// This ensures fresh data is fetched from the new endpoint
			try {
				queryClient.clear();
			} catch {}

			const endpoint = config.enabled && config.endpoint ? ` → ${config.endpoint}` : '';
			const authInfo = config.enabled ? (config.skipAuth ? ' (no auth)' : ' (with auth)') : '';
			directConnectLogger.info(`${ctx}: ${config.enabled ? 'enabled' : 'disabled'}${endpoint}${authInfo}`);
		},

		clearDirectConnect: (ctx) => {
			const current = get().directConnect[ctx];

			// Skip if already disabled
			if (!current.enabled && current.endpoint === null) {
				return;
			}

			set((s) => ({
				directConnect: {
					...s.directConnect,
					[ctx]: { ...DEFAULT_DIRECT_CONNECT },
				},
			}));

			// Clear query cache
			try {
				queryClient.clear();
			} catch {}

			directConnectLogger.info(`${ctx}: cleared`);
		},

		isDirectConnectEnabled: (ctx) => {
			return get().directConnect[ctx]?.enabled ?? false;
		},

		getDirectConnectEndpoint: (ctx) => {
			const dc = get().directConnect[ctx];
			return dc?.enabled ? dc.endpoint : null;
		},

		shouldBypassAuth: (ctx) => {
			const dc = get().directConnect[ctx];
			return dc?.enabled && dc?.skipAuth === true;
		},
	};
};

export const serializeEnvSlice = (state: EnvSlice) => ({
	env: {
		endpointOverrides: state.endpointOverrides,
	},
});

export const deserializeEnvSlice = (persisted: any): Partial<EnvSlice> => {
	const env = persisted?.env;
	if (!env) return initialEnvState;
	const endpointOverrides = schemaContexts.reduce(
		(acc, ctx) => {
			acc[ctx] = env.endpointOverrides?.[ctx] ?? null;
			return acc;
		},
		{} as Record<SchemaContext, string | null>,
	);

	return {
		endpointOverrides,
		// Direct Connect is intentionally NOT restored from persistence
		// It should always start disabled for safety
		directConnect: createInitialDirectConnect(),
	};
};
