import { NextResponse } from 'next/server';

import { readJsonBody, sameOriginGuard } from '@/lib/bff/request-guard';
import { APP_ORIGIN, SSO_GATEWAY_URL } from '@/lib/sso/gateway';

interface VerifySmsOtpBody {
	phone?: string;
	code?: string;
}

/** E.164 (the lane rejects anything else, but refuse it here first). */
const E164 = /^\+[1-9]\d{7,14}$/;
/** Six digits — the length the tenant's manifest pins the code to. */
const CODE = /^\d{6}$/;

/**
 * POST /api/auth/verify-sms-otp — spend the SMS code and land the session.
 *
 * The gateway's /auth/sms-code page owns the sign-in (the session cookie is
 * set host-only on localhost); this relay posts the form server-side, keeps
 * the redirect's Set-Cookie (cookies ignore ports, so the app origin
 * receives it too) and answers JSON the in-app code form can render. The
 * browser never sees the gateway's page.
 */
export async function POST(req: Request): Promise<NextResponse> {
	const csrf = sameOriginGuard(req);
	if (csrf) return csrf;

	const body = await readJsonBody<VerifySmsOtpBody>(req);
	if (!body) {
		return NextResponse.json({ error: 'invalid JSON body' }, { status: 400 });
	}
	const phone = body.phone?.trim();
	const code = body.code?.trim();
	if (!phone || !E164.test(phone)) {
		return NextResponse.json({ error: 'phone must be in E.164 format (+country number)' }, { status: 400 });
	}
	if (!code || !CODE.test(code)) {
		return NextResponse.json({ error: 'code must be six digits' }, { status: 400 });
	}

	let res: Response;
	try {
		res = await fetch(`${SSO_GATEWAY_URL}/auth/sms-code`, {
			method: 'POST',
			headers: { 'content-type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({ phone, code, next: `${APP_ORIGIN}/` }),
			redirect: 'manual',
			cache: 'no-store',
			signal: AbortSignal.timeout(10_000),
		});
	} catch {
		return NextResponse.json({ error: 'GATEWAY_UNREACHABLE' }, { status: 502 });
	}

	// Success is the gateway's redirect carrying the session cookie.
	const sessionCookies = res.headers.getSetCookie();
	if (res.status >= 300 && res.status < 400 && sessionCookies.length > 0) {
		const next = res.headers.get('location') ?? '/';
		const response = NextResponse.json({ ok: true, next });
		for (const cookie of sessionCookies) response.headers.append('set-cookie', cookie);
		return response;
	}

	// A refusal is the gateway's error page: the tenant's own code in
	// <p class="error">…</p> (INVALID_CODE, ACCOUNT_NOT_FOUND, …).
	const html = await res.text();
	const refusal = /<p class="error">([A-Z0-9_]+)<\/p>/.exec(html)?.[1];
	return NextResponse.json(
		{ error: refusal ?? 'SMS_SIGN_IN_FAILED' },
		{ status: res.status >= 500 ? 502 : 400 }
	);
}
