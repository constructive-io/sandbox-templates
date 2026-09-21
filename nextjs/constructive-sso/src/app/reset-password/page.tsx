import { redirect } from 'next/navigation';
import type { Route } from 'next';

import { SSO_GATEWAY_URL } from '@/lib/sso/gateway';

/**
 * Password reset is owned by the platform's mantra page set — this page is a
 * thin redirect to the gateway's /reset-password (see the README do-this
 * table). The recovery link carries its token in the query string, so every
 * search param is forwarded verbatim for mantra to spend.
 */
export default async function ResetPasswordPage({
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
	redirect(`${SSO_GATEWAY_URL}/reset-password${search ? `?${search}` : ''}` as Route);
}
