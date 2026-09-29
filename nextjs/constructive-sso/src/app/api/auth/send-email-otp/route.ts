import { NextResponse } from 'next/server';

import { readJsonBody, sameOriginGuard } from '@/lib/bff/request-guard';
import { GatewayError, gatewayPost } from '@/lib/sso/gateway';

interface SendEmailOtpBody {
	email?: string;
}

/** The lane enqueues the email itself; this only refuses obviously bad input. */
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * POST /api/auth/send-email-otp — relay the address to the gateway's anonymous
 * `auth_flows:send_email_otp` lane, which enqueues the platform's email cloud
 * function against THIS tenant (the function reads the sender identity
 * configure-email.ts provisioned). No session needed: the lane is anonymous
 * and rate-limited per IP by the platform.
 */
export async function POST(req: Request): Promise<NextResponse> {
	const csrf = sameOriginGuard(req);
	if (csrf) return csrf;

	const body = await readJsonBody<SendEmailOtpBody>(req);
	if (!body) {
		return NextResponse.json({ error: 'invalid JSON body' }, { status: 400 });
	}
	const email = typeof body.email === 'string' ? body.email.trim() : '';
	if (!email || !EMAIL.test(email)) {
		return NextResponse.json({ error: 'email must be a valid address' }, { status: 400 });
	}

	try {
		await gatewayPost<{ sent: boolean }>('/auth/send-email-otp', { email }, null);
		return NextResponse.json({ sent: true });
	} catch (err) {
		if (err instanceof GatewayError) {
			return NextResponse.json({ error: err.code }, { status: err.status === 400 ? 400 : 502 });
		}
		throw err;
	}
}
