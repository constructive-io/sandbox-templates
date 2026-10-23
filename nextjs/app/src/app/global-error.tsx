'use client';

import './globals.css';

import { AppErrorState } from '@/components/app-error';
import { appConfig } from '@/config/app';

/** The root layout itself crashed: this replaces it, so it brings its own document and styles. */
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
	return (
		<html lang='en' className='h-full'>
			<body className='grid h-full place-items-center bg-background p-4 font-sans text-foreground antialiased'>
				<title>{appConfig.name}</title>
				<AppErrorState error={error} retry={retry} className='w-full max-w-md' />
			</body>
		</html>
	);
}
