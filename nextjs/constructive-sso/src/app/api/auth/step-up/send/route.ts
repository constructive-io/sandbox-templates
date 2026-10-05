import { NextResponse } from 'next/server';

import { sameOriginGuard } from '@/lib/bff/request-guard';
import { GatewayError, gatewayPost, sessionCredential } from '@/lib/sso/gateway';

/**
 * POST /api/auth/step-up/send — text the signed-in caller the code a
 * sensitive action's step-up demand asks for.
 *
 * Relays to the gateway's authenticated `auth_flows:send_step_up_code` lane
 * with the session as the bearer: the tenant texts the account's own verified
 * primary number (nothing in the request names a number), and its refusals —
 * `STEP_UP_CODE_NOT_SENT` for an account with no number to text,
 * `TOO_MANY_REQUESTS` inside the 60-second resend window — come back as codes
 * the dialog can name.
 */
export async function POST(req: Request): Promise<NextResponse> {
	const csrf = sameOriginGuard(req);
	if (csrf) return csrf;

	const session = await sessionCredential();
	if (!session) {
		return NextResponse.json({ error: 'NOT_AUTHENTICATED' }, { status: 401 });
	}

	try {
		const result = await gatewayPost<{ sent: boolean }>('/auth/send-step-up-code', {}, session);
		return NextResponse.json({ sent: result.sent === true });
	} catch (err) {
		if (err instanceof GatewayError) {
			return NextResponse.json({ error: err.code }, { status: err.status >= 500 ? 502 : err.status });
		}
		throw err;
	}
}
