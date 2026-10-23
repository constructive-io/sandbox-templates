'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import type { ResourceRouter } from '@/components/ui/resource-kit';
import { resourcePaths } from '@/resources';

/**
 * A next/link with the link shape resource-kit and auth-pages take. Nav rows
 * hand it every anchor prop (aria-current, the click that closes the drawer),
 * so they all pass through.
 */
export function RouterLink({ href, ...props }: Omit<React.ComponentProps<'a'>, 'href'> & { href: string }) {
	return <Link href={href} {...props} />;
}

const listHref = (resource: string) => resourcePaths[resource] ?? `/${resource}`;

/** resource-kit's router on Next.js: client-side links and navigation. */
export function useResourceRouter(): ResourceRouter {
	const router = useRouter();
	return React.useMemo(
		() => ({
			Link: RouterLink,
			navigate: (href: string) => router.push(href),
			listHref,
			detailHref: (resource: string, id: string) => `${listHref(resource)}/${encodeURIComponent(id)}`,
		}),
		[router],
	);
}
