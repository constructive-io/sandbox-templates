'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { useSession } from '@/lib/auth/session';
import { ResourceKitProvider } from '@/components/ui/resource-kit';
import { AppShell } from '@/components/app-shell';
import { useResourceRouter } from '@/components/resource-router';
import { resourceIcons, resources } from '@/resources';

/** Everything under (app) needs a session; without one, go sign in and come back. */
export default function AppLayout({ children }: { children: React.ReactNode }) {
	const session = useSession();
	const router = useRouter();
	const pathname = usePathname() ?? '/';
	const resourceRouter = useResourceRouter();

	React.useEffect(() => {
		if (session.status !== 'anonymous') return;
		// A record page's id is in the query, so the way back keeps it.
		const back = `${pathname}${window.location.search}`;
		router.replace(back === '/' ? '/sign-in' : `/sign-in?next=${encodeURIComponent(back)}`);
	}, [session.status, pathname, router]);

	if (session.status !== 'authenticated') return <div className='h-dvh bg-background' />;

	return (
		<ResourceKitProvider router={resourceRouter} resources={resources} icons={resourceIcons}>
			<AppShell>{children}</AppShell>
		</ResourceKitProvider>
	);
}
