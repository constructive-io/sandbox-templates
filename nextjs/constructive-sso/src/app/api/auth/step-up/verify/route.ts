import { NextResponse } from 'next/server';

import { readJsonBody, sameOriginGuard } from '@/lib/bff/request-guard';
import { GatewayError, gatewayPost, sessionCredential } from '@/lib/sso/gateway';

interface VerifyStepUpBody {
	code?: string;
}

/** Six digits — the length the step-up senders mint. */
const CODE = /^\d{6}$/;

/**
 * POST /api/auth/step-up/verify — spend the step-up code.
 *
 * Relays to the gateway's authenticated `auth_flows:verify_step_up_code`
 * lane. On a correct code the tenant stamps THIS session `last_mfa_verified`,
 * which is what the guarded write (`require_step_up('mfa')`) reads when the
 * caller retries it through the GraphQL proxy — the same session cookie
 * travels as the bearer on both. A wrong code is `verified: false` (counted
 * toward the lockout), not an error.
 */
export async function POST(req: Request): Promise<NextResponse> {
	const csrf = sameOriginGuard(req);
	if (csrf) return csrf;

	const body = await readJsonBody<VerifyStepUpBody>(req);
	const code = typeof body?.code === 'string' ? body.code.trim() : '';
	if (!CODE.test(code)) {
		return NextResponse.json({ error: 'code must be six digits' }, { status: 400 });
	}

	const session = await sessionCredential();
	if (!session) {
		return NextResponse.json({ error: 'NOT_AUTHENTICATED' }, { status: 401 });
	}

	try {
		const result = await gatewayPost<{ verified: boolean }>('/auth/verify-step-up-code', { code }, session);
		return NextResponse.json({ verified: result.verified === true });
	} catch (err) {
		if (err instanceof GatewayError) {
			return NextResponse.json({ error: err.code }, { status: err.status >= 500 ? 502 : err.status });
		}
		throw err;
	}
}
