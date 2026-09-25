import { NextResponse } from 'next/server';

import { readChallengeCookie } from '@/lib/bff/challenge-cookie';
import { readJsonBody, sameOriginGuard } from '@/lib/bff/request-guard';
import { GatewayError, gatewayPost } from '@/lib/sso/gateway';

/**
 * POST /api/custom-auth/mfa/send-code — text the second factor for the
 * challenge parked by this app's sign-in.
 *
 * The route exists because the platform's /2fa page assumes an authenticator
 * app and never asks the tenant to send a code; the person mid-challenge has
 * no session yet, and possession of the challenge token is the proof the
 * tenant accepts for the send. The token stays in the HttpOnly cookie — the
 * body carries nothing but which lane to use.
 */
export async function POST(req: Request): Promise<NextResponse> {
  const csrf = sameOriginGuard(req);
  if (csrf) return csrf;

  const body = await readJsonBody<{ method?: string }>(req);
  const challenge = readChallengeCookie(req.headers.get('cookie'));
  if (!challenge) {
    return NextResponse.json({ error: 'MFA_CHALLENGE_MISSING' }, { status: 400 });
  }

  try {
    const result = await gatewayPost<{ sent: boolean }>(
      '/auth/send-mfa-code',
      {
        user_id: challenge.userId,
        mfa_challenge_token: challenge.mfaChallengeToken,
        method: body?.method === 'email' ? 'email' : 'sms'
      },
      null
    );
    return NextResponse.json({ sent: result.sent === true });
  } catch (err) {
    if (err instanceof GatewayError) {
      return NextResponse.json({ error: err.code }, { status: err.status === 400 ? 400 : 502 });
    }
    throw err;
  }
}
