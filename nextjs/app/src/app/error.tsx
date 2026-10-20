'use client';

import { AppErrorState } from '@/components/app-error';

const PAGE_CLASS = 'grid min-h-dvh place-items-center bg-background p-4';

/** A crash outside the pages' own boundary: a layout under the root (the shell, the auth pages). */
export default function RootError({ error, retry }: { error: unknown; retry: () => void }) {
	return (
		<main className={PAGE_CLASS}>
			<AppErrorState error={error} retry={retry} className='w-full max-w-md' />
		</main>
	);
}
