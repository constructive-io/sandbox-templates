'use client';

/**
 * @constructive/blocks-runtime
 *
 * The ONE wiring point for Constructive blocks. The host mounts this once at
 * the app root; every data block declares it as a `registryDependency`. It does
 * two things and nothing else:
 *
 *   1. Provides a single shared `QueryClient` — reusing the host's existing
 *      `QueryClientProvider` if one is already in the tree, otherwise mounting
 *      one. (Two QueryClients is the failure mode we avoid.)
 *   2. Calls each namespace's generated `configure()` (from `@/generated/<ns>`)
 *      with the template's dynamic config: `getEndpoint(ns)` /
 *      `getAuthHeaders(ns)` are evaluated per request, so Direct Connect
 *      endpoint overrides and login/logout token changes never go stale.
 *
 * Blocks never mount a provider, never call `configure()`/`getClient()`, and
 * never read the token themselves — all of that lives here.
 *
 * @example
 * ```tsx
 * <BlocksRuntime namespaces={['auth', 'admin']}>
 *   {children}
 * </BlocksRuntime>
 * ```
 */

import { type ReactNode, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';

import { getEndpoint, type SchemaContext } from '@/app-config';
import { createSdkFetch, getAuthHeaders } from '@/graphql/execute';
import type { OrmClientConfig } from '@/generated/auth';
import { configure as configureAuth } from '@/generated/auth';
import { configure as configureAdmin } from '@/generated/admin';

/**
 * Known Constructive SDK namespaces for this app. A host that generates
 * additional namespaces extends this union and the map below — the single
 * expected edit to this file, since it is the app's wiring point.
 */
export type BlocksNamespace = 'auth' | 'admin';

type ConfigureFn = (config: OrmClientConfig) => void;

/** namespace → its generated `configure()`. */
const CONFIGURERS: Record<BlocksNamespace, ConfigureFn> = {
	auth: configureAuth,
	admin: configureAdmin
};

/** Session-aware fetch for the generated SDK clients. */
const sdkFetch = createSdkFetch();

/**
 * Shared SDK configuration factory — binds a namespace to its GraphQL
 * endpoint. The endpoint getter and headers getter ensure changes to
 * Direct Connect / UI overrides and login/logout are picked up on every
 * request without needing to re-call configure().
 */
function createNamespaceConfig(ns: BlocksNamespace): OrmClientConfig {
	const ctx = ns as SchemaContext;
	return {
		get endpoint() {
			return getEndpoint(ctx);
		},
		get headers() {
			return getAuthHeaders(ctx);
		},
		// The generated FetchAdapter omits credentials/CSRF; without them
		// cross-origin requests run as `anonymous`. See createSdkFetch().
		fetch: sdkFetch,
	};
}

export interface BlocksRuntimeProps {
	/** Namespaces to configure; each must have a generated SDK at `@/generated/<ns>`. */
	namespaces: BlocksNamespace[];
	/**
	 * Per-namespace endpoint overrides (static). Takes precedence over the
	 * dynamic `getEndpoint(ns)` resolution. Hosts that switch endpoints at
	 * runtime pass URLs here. Changing a value reconfigures the namespace.
	 */
	endpoints?: Partial<Record<BlocksNamespace, string>>;
	children: ReactNode;
}

/**
 * Returns the host's `QueryClient` if a provider is already in the tree, else
 * `null`. `useQueryClient()` throws when unprovided; we treat that as "none".
 */
function useExistingQueryClient(): QueryClient | null {
	try {
		// eslint-disable-next-line react-hooks/rules-of-hooks -- one unconditional call; the throw path only means "no host provider"
		return useQueryClient();
	} catch {
		return null;
	}
}

export function BlocksRuntime({ namespaces, endpoints, children }: BlocksRuntimeProps) {
	// Configure each namespace once per (namespace, endpoint-override)-set,
	// during render (before children) so a child's mount-time request never
	// hits an unconfigured client. configure() is an idempotent singleton
	// rebuild; the key includes endpoint overrides so a runtime switch
	// reconfigures the affected namespaces.
	const configuredKey = useRef<string | null>(null);
	const key = namespaces.map((ns) => `${ns}=${endpoints?.[ns] ?? ''}`).join(',');
	if (configuredKey.current !== key) {
		for (const ns of namespaces) {
			const configure = CONFIGURERS[ns];
			if (!configure) {
				console.warn(`[blocks-runtime] Unknown namespace "${ns}" — no generated configure() registered.`);
				continue;
			}
			const override = endpoints?.[ns];
			configure(override ? { endpoint: override } : createNamespaceConfig(ns));
		}
		configuredKey.current = key;
	}

	// Host-safe: reuse the host's QueryClient if present, else mount our own.
	const existing = useExistingQueryClient();
	const [created] = useState(() => (existing ? null : new QueryClient()));

	if (existing) return <>{children}</>;
	return <QueryClientProvider client={created as QueryClient}>{children}</QueryClientProvider>;
}
