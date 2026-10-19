'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { nextPath } from '@/lib/auth/next-path';
import { useSession } from '@/lib/auth/session';
import { AuthLayout } from '@/components/ui/auth-pages';
import { RouterLink } from '@/components/resource-router';
import { appConfig } from '@/config/app';

// Someone already signed in has no business on these two.
const SIGNED_OUT_ONLY = new Set(['/sign-in', '/sign-up']);

export default function AuthGroupLayout({ children }: { children: React.ReactNode }) {
	const session = useSession();
	const router = useRouter();
	const pathname = usePathname() ?? '';

	React.useEffect(() => {
		if (session.status === 'authenticated' && SIGNED_OUT_ONLY.has(pathname)) {
			router.replace(nextPath(new URLSearchParams(window.location.search).get('next')));
		}
	}, [session.status, pathname, router]);

	return (
		<AuthLayout
			brand={{ name: appConfig.name, href: '/' }}
			footer={appConfig.tagline || undefined}
			linkComponent={RouterLink}
		>
			{children}
		</AuthLayout>
	);
}
