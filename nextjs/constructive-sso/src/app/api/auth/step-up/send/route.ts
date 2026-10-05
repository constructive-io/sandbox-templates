import { NextResponse } from 'next/server';

import { readJsonBody, sameOriginGuard } from '@/lib/bff/request-guard';
import { GatewayError, gatewayPost, sessionCredential } from '@/lib/sso/gateway';

interface SendStepUpBody {
	method?: string;
}

/**
 * POST /api/auth/step-up/send — send the signed-in caller the code a
 * sensitive action's step-up demand asks for.
 *
 * Relays to the gateway's authenticated `auth_flows:send_step_up_code` lane
 * with the session as the bearer. `method` names the factor — `sms` texts the
 * account's own verified primary number, `email` mails its verified primary
 * address — and absent, the tenant picks the account's own sign-in channel
 * (a text for a phone sign-up, an email otherwise). Nothing in the request
 * names a number or an address. The answer says which factor the code went
 * through, so the dialog can say where to look; the tenant's refusals come
 * back as codes it can name: `STEP_UP_CODE_NOT_SENT` for an account with no
 * such identifier, `TOO_MANY_REQUESTS` inside that factor's 60-second resend
 * window.
 */
export async function POST(req: Request): Promise<NextResponse> {
	const csrf = sameOriginGuard(req);
	if (csrf) return csrf;

	const body = await readJsonBody<SendStepUpBody>(req);
	const method = body?.method;
	if (method !== undefined && method !== 'sms' && method !== 'email') {
		return NextResponse.json({ error: 'method must be sms or email' }, { status: 400 });
	}

	const session = await sessionCredential();
	if (!session) {
		return NextResponse.json({ error: 'NOT_AUTHENTICATED' }, { status: 401 });
	}

	try {
		const result = await gatewayPost<{ sent: boolean; method: 'sms' | 'email' }>(
			'/auth/send-step-up-code',
			method ? { method } : {},
			session
		);
		return NextResponse.json({ sent: result.sent === true, method: result.method });
	} catch (err) {
		if (err instanceof GatewayError) {
			return NextResponse.json({ error: err.code }, { status: err.status >= 500 ? 502 : err.status });
		}
		throw err;
	}
}
