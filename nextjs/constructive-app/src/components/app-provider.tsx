'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { getSubEndpoint } from '@/app-config';
import { getAuthHeaders } from '@/graphql/execute';
import { configure as configureAdmin } from '@sdk/api';
import { configure as configureAppPublic } from '@sdk/api';
import { configure as configureAuth } from '@sdk/api';
import { AuthProvider } from '@/lib/auth/auth-context';
import { SchemaBuilderDataProvider } from '@/lib/gql/hooks/schema-builder';
import { queryClient } from '@/lib/query-client';

// Initialize all 3 SDK clients at module load time (before any queries can fire).
// Each targets its own endpoint but shares the same auth headers (same JWT).
// Endpoint uses a getter so changes to Direct Connect / UI overrides are picked up
// on every request without needing to re-call configure().
const sbHeaders = () => getAuthHeaders('schema-builder');

configureAppPublic({ get endpoint() { return getSubEndpoint('app-public'); }, getHeaders: sbHeaders });
configureAuth({ get endpoint() { return getSubEndpoint('auth'); }, getHeaders: sbHeaders });
configureAdmin({ get endpoint() { return getSubEndpoint('admin'); }, getHeaders: sbHeaders });

export function AppProvider({ children }: { children: React.ReactNode }) {
	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<NuqsAdapter>
					<SchemaBuilderDataProvider>{children}</SchemaBuilderDataProvider>
				</NuqsAdapter>
			</AuthProvider>
		</QueryClientProvider>
	);
}
