import { NextResponse } from 'next/server';

import { readJsonBody, sameOriginGuard } from '@/lib/bff/request-guard';
import { AuthRefusal, authClient, runAuth } from '@/lib/sso/auth-graphql';

interface SendStepUpBody {
	method?: string;
}

/**
 * POST /api/auth/step-up/send — send the signed-in caller the code a
 * sensitive action's step-up demand asks for, through the tenant's
 * `sendStepUpCode`.
 *
 * `method` names the factor — `sms` texts the account's own verified primary
 * number, `email` mails its verified primary address. The answer says which
 * factor the code went through, so the dialog can say where to look. A null
 * result is the per-method resend cooldown: the tenant declines a second
 * send inside its window by answering null, not by raising, so this route
 * translates that to TOO_MANY_REQUESTS itself. The tenant's named refusals
 * pass through as `{error}` with their own 4xx: STEP_UP_METHOD_REQUIRED
 * (both factors on — the caller must pick), MFA_METHOD_NOT_ENABLED (no
 * factor on), TOO_MANY_REQUESTS (the IP throttle), NOT_AUTHENTICATED.
 */
export async function POST(req: Request): Promise<NextResponse> {
	const csrf = sameOriginGuard(req);
	if (csrf) return csrf;

	const body = await readJsonBody<SendStepUpBody>(req);
	const method = body?.method;
	if (method !== undefined && method !== 'sms' && method !== 'email') {
		return NextResponse.json({ error: 'method must be sms or email' }, { status: 400 });
	}

	const db = authClient(req);
	try {
		const { sendStepUpCode } = await runAuth(
			db.mutation.sendStepUpCode(
				{ input: method ? { method } : {} },
				{ select: { result: true } }
			)
		);
		const used = sendStepUpCode?.result ?? null;
		if (used !== 'email' && used !== 'sms') {
			// null: the per-method resend window, answered rather than raised.
			return NextResponse.json({ sent: false, error: 'TOO_MANY_REQUESTS' }, { status: 200 });
		}
		return NextResponse.json({ sent: true, method: used });
	} catch (err) {
		if (err instanceof AuthRefusal) {
			return NextResponse.json({ error: err.code }, { status: err.status });
		}
		throw err;
	}
}
