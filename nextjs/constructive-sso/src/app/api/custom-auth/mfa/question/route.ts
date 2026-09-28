import { NextResponse } from 'next/server';

import { readChallengeCookie } from '@/lib/bff/challenge-cookie';
import { readJsonBody, sameOriginGuard } from '@/lib/bff/request-guard';
import { GatewayError, gatewayPost } from '@/lib/sso/gateway';

/**
 * POST /api/custom-auth/mfa/question — the one question this challenge will
 * ask. Read-only relay of the gateway's challenge-question lane; the token
 * stays in the HttpOnly cookie.
 */
export async function POST(req: Request): Promise<NextResponse> {
  const csrf = sameOriginGuard(req);
  if (csrf) return csrf;

  await readJsonBody(req);
  const challenge = readChallengeCookie(req.headers.get('cookie'));
  if (!challenge) {
    return NextResponse.json({ error: 'MFA_CHALLENGE_MISSING' }, { status: 400 });
  }

  try {
    const result = await gatewayPost<{ question: string }>(
      '/auth/challenge-question',
      { user_id: challenge.userId, mfa_challenge_token: challenge.mfaChallengeToken },
      null
    );
    return NextResponse.json({ question: result.question });
  } catch (err) {
    if (err instanceof GatewayError) {
      return NextResponse.json({ error: err.code }, { status: err.status === 400 ? 400 : 502 });
    }
    throw err;
  }
}
