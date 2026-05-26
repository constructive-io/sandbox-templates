'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { getEndpoint, type SchemaContext } from '@/app-config';
import { getAuthHeaders } from '@/graphql/execute';
import { configure as configureAdmin } from '@sdk/admin';
import { configure as configureAuth } from '@sdk/auth';
import { configure as configureApp } from '@sdk/app';
import { AuthProvider } from '@/lib/auth/auth-context';
import { queryClient } from '@/lib/query-client';

// Shared SDK configuration factory — binds a schema context to its GraphQL endpoint.
// The endpoint getter and headers getter ensure changes to Direct Connect / UI overrides
// are picked up on every request without needing to re-call configure().
function createSdkConfig(ctx: SchemaContext) {
	return {
		get endpoint() {
			return getEndpoint(ctx);
		},
		get headers() {
			return getAuthHeaders(ctx);
		},
	};
}

// Initialize all SDK clients at module load time (before any queries can fire).
configureAdmin(createSdkConfig('admin'));
configureAuth(createSdkConfig('auth'));
configureApp(createSdkConfig('app'));

export function AppProvider({ children }: { children: React.ReactNode }) {
	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<NuqsAdapter>{children}</NuqsAdapter>
			</AuthProvider>
		</QueryClientProvider>
	);
}
