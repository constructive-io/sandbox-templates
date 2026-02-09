'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { getEndpoint } from '@/app-config';
import { getAuthHeaders } from '@/graphql/execute';
import { configure } from '@sdk/api';
import { AuthProvider } from '@/lib/auth/auth-context';
import { queryClient } from '@/lib/query-client';

// Initialize the SDK client at module load time (before any queries can fire).
// Endpoint uses a getter so changes to Direct Connect / UI overrides are picked up
// on every request without needing to re-call configure().
configure({
	get endpoint() { return getEndpoint('schema-builder')!; },
	getHeaders: () => getAuthHeaders('schema-builder'),
});

export function AppProvider({ children }: { children: React.ReactNode }) {
	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<NuqsAdapter>{children}</NuqsAdapter>
			</AuthProvider>
		</QueryClientProvider>
	);
}
