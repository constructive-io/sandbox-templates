import { NextResponse } from 'next/server';

import { deviceCookie, maxAgeFromExpiresAt, sessionCookie } from '@/lib/bff/session-cookie';
import { readJsonBody, sameOriginGuard } from '@/lib/bff/request-guard';
import { authClient, authErrorResponse, deviceTokenOf, GATEWAY_ORIGIN, runAuth } from '@/lib/sso/auth-graphql';

interface VerifySmsOtpBody {
	phone?: string;
	code?: string;
}

/** E.164 (the tenant rejects anything else, but refuse it here first). */
const E164 = /^\+[1-9]\d{7,14}$/;
/** Six digits — the length the tenant's manifest pins the code to. */
const CODE = /^\d{6}$/;

/**
 * POST /api/auth/verify-sms-otp — spend the SMS code and land the session,
 * through the tenant's `signInSmsOtp`.
 *
 * A usable access token mints the app cookie here (built by the central
 * helper; the token never appears in the response body). An MFA-enrolled
 * account gets `mfaRequired` and no session, exactly like the password
 * lane — the hosted `/login` owns the challenge. A wrong or lapsed code is
 * `INVALID_CODE`: the tenant answers null for a number it never texted and
 * a code that does not match alike.
 *
 * Trusted devices (upstream #2199): like the password lane, a device token
 * the tenant hands back is kept as the `constructive_device_token` cookie,
 * and one this browser already holds is fed back as `deviceToken`.
 */
export async function POST(req: Request): Promise<NextResponse> {
	const csrf = sameOriginGuard(req);
	if (csrf) return csrf;

	const body = await readJsonBody<VerifySmsOtpBody>(req);
	if (!body) {
		return NextResponse.json({ error: 'invalid JSON body' }, { status: 400 });
	}
	// typeof guards: optional chaining only skips null/undefined — non-string
	// values (e.g. {"phone":123}) would throw on .trim() outside the try below.
	const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
	const code = typeof body.code === 'string' ? body.code.trim() : '';
	if (!phone || !E164.test(phone)) {
		return NextResponse.json({ error: 'phone must be in E.164 format (+country number)' }, { status: 400 });
	}
	if (!code || !CODE.test(code)) {
		return NextResponse.json({ error: 'code must be six digits' }, { status: 400 });
	}

	const device = deviceTokenOf(req);
	// Anonymous lane: no session forwarded — a stale cookie must not
  // poison a mutation that needs no session (see authClient).
  const db = authClient(req, { anonymous: true });
	try {
		const { signInSmsOtp } = await runAuth(
			db.mutation.signInSmsOtp(
				{
					input: {
						phone,
						code,
						credentialKind: 'access_token',
						// The trusted-device token an earlier sign-in left, when present.
						...(device ? { deviceToken: device } : {})
					}
				},
				{
					select: {
						result: {
							select: {
								userId: true,
								accessToken: true,
								accessTokenExpiresAt: true,
								mfaRequired: true,
								deviceApprovalRequired: true,
								outDeviceToken: true
							}
						}
					}
				}
			)
		);
		const result = signInSmsOtp?.result ?? null;

		// A device token is kept whatever the outcome — the same rule the
		// password lane and the hosted pages follow.
		const deviceHeaders = (): Headers => {
			const headers = new Headers();
			if (result?.outDeviceToken) {
				headers.append('set-cookie', deviceCookie(result.outDeviceToken));
			}
			return headers;
		};

		if (result?.deviceApprovalRequired) {
			return NextResponse.json(
				{ error: 'DEVICE_APPROVAL_REQUIRED' },
				{ status: 200, headers: deviceHeaders() }
			);
		}
		if (result?.mfaRequired) {
			// The phone lane's own challenge: the hosted /login/phone is where
			// this number's code was asked for, so its challenge lands there.
			return NextResponse.json(
				{
					mfaRequired: true,
					error: 'MFA_REQUIRED',
					next: `${GATEWAY_ORIGIN}/login/phone?next=%2F`
				},
				{ status: 200, headers: deviceHeaders() }
			);
		}
		if (!result?.accessToken) {
			return NextResponse.json({ error: 'INVALID_CODE' }, { status: 200 });
		}

		const headers = new Headers();
		headers.append(
			'set-cookie',
			sessionCookie(result.accessToken, maxAgeFromExpiresAt(result.accessTokenExpiresAt))
		);
		if (result.outDeviceToken) {
			headers.append('set-cookie', deviceCookie(result.outDeviceToken));
		}
		return NextResponse.json({ ok: true, next: '/' }, { headers });
	} catch (err) {
		return authErrorResponse(err);
	}
}
