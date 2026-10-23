'use client';

import Link from 'next/link';
import { SearchXIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/workspace-kit';

/**
 * A URL with no page, e.g. the list of a table that left the database (gen removes its routes).
 * Marked like the error boundaries, so the desktop's render check fails a page that isn't there.
 */
export default function NotFound() {
	return (
		<main className='grid min-h-dvh place-items-center bg-background p-4'>
			<div data-app-error='not-found' className='w-full max-w-md'>
				<EmptyState
					className='rounded-xl bg-card shadow-card'
					icon={SearchXIcon}
					title='Page not found'
					description='This page doesn’t exist, or its table is no longer in the database.'
					action={
						<Button size='sm' variant='outline' asChild>
							<Link href='/'>Go to home</Link>
						</Button>
					}
				/>
			</div>
		</main>
	);
}
