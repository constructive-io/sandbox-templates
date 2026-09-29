import { NextResponse } from 'next/server';

import { readJsonBody, sameOriginGuard } from '@/lib/bff/request-guard';
import { GatewayError, gatewayPost } from '@/lib/sso/gateway';

interface RequestMagicLinkBody {
	email?: string;
}

/** The lane enqueues the email itself; this only refuses obviously bad input. */
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * POST /api/auth/request-magic-link — relay the address to the gateway's
 * anonymous `auth_flows:request_magic_link` lane. The tenant mints the one-time
 * token, keeps only its hash, and queues `email:send_magic_link` against this
 * tenant (the email function reads the sender identity configure-email.ts
 * provisioned). The plaintext token never travels in this reply — the whole
 * point of a link mailed to an address somebody has to own.
 */
export async function POST(req: Request): Promise<NextResponse> {
	const csrf = sameOriginGuard(req);
	if (csrf) return csrf;

	const body = await readJsonBody<RequestMagicLinkBody>(req);
	if (!body) {
		return NextResponse.json({ error: 'invalid JSON body' }, { status: 400 });
	}
	const email = typeof body.email === 'string' ? body.email.trim() : '';
	if (!email || !EMAIL.test(email)) {
		return NextResponse.json({ error: 'email must be a valid address' }, { status: 400 });
	}

	try {
		await gatewayPost<{ requested: boolean }>('/auth/request-magic-link', { email }, null);
		return NextResponse.json({ requested: true });
	} catch (err) {
		if (err instanceof GatewayError) {
			return NextResponse.json({ error: err.code }, { status: err.status === 400 ? 400 : 502 });
		}
		throw err;
	}
}
