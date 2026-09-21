import { redirect } from 'next/navigation';
import type { Route } from 'next';

import { SSO_GATEWAY_URL } from '@/lib/sso/gateway';

/**
 * Sign-in is owned by the platform's mantra page set — this page is a thin
 * redirect to the gateway's /login (see the README do-this table). The app no
 * longer renders a sign-in form. Every search param is forwarded verbatim:
 * OAuth refusals land here as /login?error=SSO_… and mantra's sign-in page
 * names the code, so dropping the query would hide why sign-in failed.
 */
export default async function LoginPage({
	searchParams
}: {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
	const params = await searchParams;
	const qs = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value === undefined) continue;
		if (Array.isArray(value)) {
			if (value.length > 0) qs.set(key, value[0]);
		} else {
			qs.set(key, value);
		}
	}
	const search = qs.toString();
	redirect(`${SSO_GATEWAY_URL}/login${search ? `?${search}` : ''}` as Route);
}
