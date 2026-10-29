import type { Metadata } from 'next';

import './globals.css';

import { appConfig } from '@/config/app';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
	title: appConfig.name,
	description: appConfig.tagline || undefined,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang='en' suppressHydrationWarning className='h-full'>
			<body className='h-full bg-background font-sans text-foreground antialiased'>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
