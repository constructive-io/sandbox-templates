/**
 * Env slice — endpoint overrides and Direct Connect configuration.
 *
 * No external dependencies on state-management libraries.
 * State is held by the vanilla AppStore defined in app-store.ts.
 */
import type { DirectConnectConfig, SchemaContext } from '@/lib/runtime/config-core';
import { DEFAULT_DIRECT_CONNECT, getDefaultEndpoint, schemaContexts } from '@/lib/runtime/config-core';

// ── State ──────────────────────────────────────────────────────────────

export interface EnvState {
	endpointOverrides: Record<SchemaContext, string | null>;
	directConnect: Record<SchemaContext, DirectConnectConfig>;
}

const STORAGE_KEY = (ctx: SchemaContext) => `constructive-endpoint:${ctx}`;

function readStoredOverride(ctx: SchemaContext): string | null {
	try {
		if (typeof window === 'undefined') return null;
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

export function createInitialEnvState(): EnvState {
	const bootstrapOverrides = Object.fromEntries(
		schemaContexts.map((ctx) => [ctx, readStoredOverride(ctx)]),
	) as Record<SchemaContext, string | null>;

	return {
		endpointOverrides: { ...createEmptyOverrides(), ...bootstrapOverrides },
		directConnect: createInitialDirectConnect(),
	};
}

// ── Helpers ────────────────────────────────────────────────────────────

export function getEffectiveEndpoint(state: EnvState, ctx: SchemaContext): string | null {
	const o = state.endpointOverrides[ctx];
	return o && o.trim().length ? o.trim() : getDefaultEndpoint(ctx);
}

export function persistEndpointOverride(ctx: SchemaContext, value: string | null): void {
	try {
		if (typeof window !== 'undefined' && ctx !== 'dashboard') {
			if (value === null) localStorage.removeItem(STORAGE_KEY(ctx));
			else localStorage.setItem(STORAGE_KEY(ctx), value);
		}
	} catch {}
}

// ── Serialization ──────────────────────────────────────────────────────

export function serializeEnv(state: EnvState) {
	return { endpointOverrides: state.endpointOverrides };
}

export function deserializeEnv(raw: unknown): EnvState {
	const env = raw as { endpointOverrides?: Record<SchemaContext, string | null> } | undefined;
	if (!env?.endpointOverrides) return createInitialEnvState();
	const endpointOverrides = schemaContexts.reduce(
		(acc, ctx) => {
			acc[ctx] = env.endpointOverrides?.[ctx] ?? null;
			return acc;
		},
		{} as Record<SchemaContext, string | null>,
	);
	return {
		endpointOverrides,
		directConnect: createInitialDirectConnect(),
	};
}
