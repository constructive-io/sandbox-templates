import { NextResponse } from 'next/server';

import { clearChallengeCookie, readChallengeCookie } from '@/lib/bff/challenge-cookie';
import { maxAgeFromExpiresAt, sessionCookie } from '@/lib/bff/session-cookie';
import { readJsonBody, sameOriginGuard } from '@/lib/bff/request-guard';
import { GatewayError, gatewayPost } from '@/lib/sso/gateway';

interface CompleteMfaResult {
  userId?: string;
  accessToken?: string;
  accessTokenExpiresAt?: string;
}

/**
 * POST /api/custom-auth/mfa/complete — spend the parked challenge and mint the
 * session it withheld: the JSON-lane sibling of the platform /2fa page. A
 * wrong code leaves the challenge live (the tenant counts attempts), so the
 * cookie is only cleared on success.
 */
export async function POST(req: Request): Promise<NextResponse> {
  const csrf = sameOriginGuard(req);
  if (csrf) return csrf;

  const body = await readJsonBody<{ code?: string; rememberMe?: boolean }>(req);
  if (!body?.code) {
    return NextResponse.json({ error: 'code is required' }, { status: 400 });
  }
  const challenge = readChallengeCookie(req.headers.get('cookie'));
  if (!challenge) {
    return NextResponse.json({ error: 'MFA_CHALLENGE_MISSING' }, { status: 400 });
  }

  try {
    const result = await gatewayPost<CompleteMfaResult>(
      '/auth/mfa/complete',
      {
        user_id: challenge.userId,
        mfa_challenge_token: challenge.mfaChallengeToken,
        code: body.code,
        remember_me: Boolean(body.rememberMe)
      },
      null
    );
    if (!result.accessToken) {
      return NextResponse.json({ error: 'MFA_INCOMPLETE' }, { status: 502 });
    }
    const headers = new Headers();
    headers.append(
      'set-cookie',
      sessionCookie(result.accessToken, maxAgeFromExpiresAt(result.accessTokenExpiresAt))
    );
    headers.append('set-cookie', clearChallengeCookie());
    return NextResponse.json({ signedIn: true, userId: result.userId ?? null }, { headers });
  } catch (err) {
    if (err instanceof GatewayError) {
      return NextResponse.json({ error: err.code }, { status: err.status === 400 ? 400 : 502 });
    }
    throw err;
  }
}
