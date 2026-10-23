'use client';

import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';

import { configureSdk } from '@/lib/graphql/configure-sdk';
import { isRetryable } from '@/lib/graphql/errors';

configureSdk();

// One retry for a hiccup; none when the database is unavailable, the app is out of date or the session ended.
const retry = (failureCount: number, error: unknown) => failureCount < 1 && isRetryable(error);

export function Providers({ children }: { children: React.ReactNode }) {
	const [queryClient] = React.useState(
		() => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry } } }),
	);
	return (
		<ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</ThemeProvider>
	);
}
