import { NextResponse } from 'next/server';

import { sessionCredential } from '@/lib/sso/gateway';
import { GatewayError, gatewayPost } from '@/lib/sso/gateway';
import { readJsonBody, sameOriginGuard } from '@/lib/bff/request-guard';

/**
 * POST /api/auth/step-up/verify — spend the code and re-verify the session.
 * On true, the mfa-freshness window (30 minutes) is open and the caller
 * retries the action that raised STEP_UP_REQUIRED_MFA.
 */
export async function POST(req: Request): Promise<NextResponse> {
  const csrf = sameOriginGuard(req);
  if (csrf) return csrf;

  const body = await readJsonBody<{ code?: string }>(req);
  if (!body?.code) {
    return NextResponse.json({ error: 'code is required' }, { status: 400 });
  }

  try {
    const result = await gatewayPost<{ verified: boolean }>(
      '/auth/verify-step-up-code',
      { code: body.code },
      (await sessionCredential())
    );
    return NextResponse.json({ verified: result.verified === true });
  } catch (err) {
    if (err instanceof GatewayError) {
      return NextResponse.json({ error: err.code }, { status: err.status === 400 ? 400 : 502 });
    }
    throw err;
  }
}
