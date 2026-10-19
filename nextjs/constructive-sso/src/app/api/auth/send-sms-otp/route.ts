import { NextResponse } from 'next/server';

import { readJsonBody, sameOriginGuard } from '@/lib/bff/request-guard';
import { authClient, authErrorResponse, runAuth } from '@/lib/sso/auth-graphql';

interface SendSmsOtpBody {
	phone?: string;
}

/** E.164 (the tenant rejects anything else, but refuse it here first). */
const E164 = /^\+[1-9]\d{7,14}$/;

/**
 * POST /api/auth/send-sms-otp — ask the tenant (`sendSmsOtp`) to text the
 * number a one-time code. The platform's sms cloud function runs against
 * THIS tenant — it reads its provider settings from the tenant's own
 * database-scope store (see packages/provision/src/configure-sms.ts). No
 * session needed: the mutation is anonymous and rate-limited per IP by the
 * tenant.
 */
export async function POST(req: Request): Promise<NextResponse> {
	const csrf = sameOriginGuard(req);
	if (csrf) return csrf;

	const body = await readJsonBody<SendSmsOtpBody>(req);
	if (!body) {
		return NextResponse.json({ error: 'invalid JSON body' }, { status: 400 });
	}
	// typeof guard: optional chaining only skips null/undefined — a non-string
	// phone (e.g. {"phone":123}) would throw on .trim() outside the try below.
	const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
	if (!phone || !E164.test(phone)) {
		return NextResponse.json({ error: 'phone must be in E.164 format (+country number)' }, { status: 400 });
	}

	// Anonymous lane: no session forwarded — a stale cookie must not
  // poison a mutation that needs no session (see authClient).
  const db = authClient(req, { anonymous: true });
	try {
		const { sendSmsOtp } = await runAuth(
			db.mutation.sendSmsOtp({ input: { phone } }, { select: { result: true } })
		);
		return NextResponse.json({ sent: sendSmsOtp?.result === true });
	} catch (err) {
		return authErrorResponse(err);
	}
}
