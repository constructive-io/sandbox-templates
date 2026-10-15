'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { getEndpoint, type SchemaContext } from '@/app-config';
import { createSdkFetch, getAuthHeaders } from '@/graphql/execute';
import { configure as configureAdmin } from '@sdk/admin';
import { configure as configureAuth } from '@sdk/auth';
import { BlocksRuntime } from '@/blocks/runtime/blocks-runtime';
import { AuthProvider } from '@/lib/auth/auth-context';
import { queryClient } from '@/lib/query-client';

// Shared SDK configuration factory — binds a schema context to its GraphQL endpoint.
// The endpoint getter and headers getter ensure changes to Direct Connect / UI overrides
// are picked up on every request without needing to re-call configure().
// `fetch` wraps the generated FetchAdapter so requests carry the session cookie + CSRF
// token (otherwise cross-origin requests run as `anonymous` — see createSdkFetch()).
const sdkFetch = createSdkFetch();
function createSdkConfig(ctx: SchemaContext) {
	return {
		get endpoint() {
			return getEndpoint(ctx);
		},
		get headers() {
			return getAuthHeaders(ctx);
		},
		fetch: sdkFetch,
	};
}

// SDK clients are configured by <BlocksRuntime> during render (the single
// wiring point) — no module-load configure here. reconfigureSdkClients()
// below remains for post-login/logout refreshes.

/**
 * Re-configure SDK clients with fresh auth headers.
 * Call after login/logout so the generated FetchAdapter picks up the new token.
 */
export function reconfigureSdkClients(): void {
	configureAdmin(createSdkConfig('admin'));
	configureAuth(createSdkConfig('auth'));
}

export function AppProvider({ children }: { children: React.ReactNode }) {
	return (
		<QueryClientProvider client={queryClient}>
			<BlocksRuntime namespaces={['auth', 'admin']}>
				<AuthProvider>
					<NuqsAdapter>{children}</NuqsAdapter>
				</AuthProvider>
			</BlocksRuntime>
		</QueryClientProvider>
	);
}
