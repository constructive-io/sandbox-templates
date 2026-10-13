import { NextResponse } from 'next/server';

import { readJsonBody, sameOriginGuard } from '@/lib/bff/request-guard';
import { AuthRefusal, authClient, runAuth } from '@/lib/sso/auth-graphql';

interface VerifyStepUpBody {
	code?: string;
}

/** Six digits — the length the step-up senders mint. */
const CODE = /^\d{6}$/;

/**
 * POST /api/auth/step-up/verify — spend the step-up code, through the
 * tenant's `verifyStepUpCode`.
 *
 * On a correct code the tenant stamps THIS session `last_mfa_verified`,
 * which is what the guarded write (`require_step_up('mfa')`) reads when the
 * caller retries it through the app's GraphQL proxy — the same session
 * cookie travels as the bearer on both. A wrong code — or a locked-out
 * caller, whose attempts the tenant counts silently — answers
 * `verified:false`; the difference between the two is the tenant's to keep.
 * STEP_UP_SESSION_INVALID means this session cannot be re-verified (wrong
 * session, or its user agent or origin no longer matches): 401, and the
 * client sends the user to sign in again.
 */
export async function POST(req: Request): Promise<NextResponse> {
	const csrf = sameOriginGuard(req);
	if (csrf) return csrf;

	const body = await readJsonBody<VerifyStepUpBody>(req);
	const code = typeof body?.code === 'string' ? body.code.trim() : '';
	if (!CODE.test(code)) {
		return NextResponse.json({ error: 'code must be six digits' }, { status: 400 });
	}

	const db = authClient(req);
	try {
		const { verifyStepUpCode } = await runAuth(
			db.mutation.verifyStepUpCode({ input: { code } }, { select: { result: true } })
		);
		if (verifyStepUpCode?.result === true) {
			return NextResponse.json({ verified: true });
		}
		return NextResponse.json({ verified: false, error: 'INVALID_CODE' }, { status: 200 });
	} catch (err) {
		if (err instanceof AuthRefusal) {
			return NextResponse.json({ error: err.code }, { status: err.status });
		}
		throw err;
	}
}
