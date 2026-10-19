'use client';

import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';

import { configureSdk } from '@/lib/graphql/configure-sdk';

configureSdk();

export function Providers({ children }: { children: React.ReactNode }) {
	const [queryClient] = React.useState(
		() => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } }),
	);
	return (
		<ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</ThemeProvider>
	);
}
