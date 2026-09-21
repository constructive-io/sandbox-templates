import { redirect } from 'next/navigation';
import type { Route } from 'next';

import { SSO_GATEWAY_URL } from '@/lib/sso/gateway';

/**
 * Sign-up is owned by the platform's mantra page set — this page is a thin
 * redirect to the gateway's /signup (see the README do-this table). Every
 * search param is forwarded verbatim (e.g. ?next=… from gateway links).
 */
export default async function RegisterPage({
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
	redirect(`${SSO_GATEWAY_URL}/signup${search ? `?${search}` : ''}` as Route);
}
