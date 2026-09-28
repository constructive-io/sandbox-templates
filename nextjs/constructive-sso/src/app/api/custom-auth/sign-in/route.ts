import { NextResponse } from 'next/server';

import { challengeCookie } from '@/lib/bff/challenge-cookie';
import { maxAgeFromExpiresAt, sessionCookie } from '@/lib/bff/session-cookie';
import { readJsonBody, sameOriginGuard } from '@/lib/bff/request-guard';
import { GatewayError, gatewayPost } from '@/lib/sso/gateway';

interface SignInBody {
  email?: string;
  password?: string;
  rememberMe?: boolean;
}

interface SignInLaneResult {
  signedIn: boolean;
  userId?: string;
  accessToken?: string;
  accessTokenExpiresAt?: string;
  mfaRequired?: boolean;
  mfaChallengeToken?: string | null;
  enrollmentRequired?: boolean;
}

/**
 * POST /api/custom-auth/sign-in — the password lane through the
 * `auth_flows:sign_in` sync lane.
 *
 * The lane answers a wrong password with `{signedIn:false}` (deliberately
 * indistinguishable from an unknown address) and an MFA account with
 * `mfaRequired` and NO usable session — milestone 1 refuses those cleanly.
 * Only a completed sign-in mints the cookie here, built by the central
 * helper; the access token never appears in the response body.
 */
export async function POST(req: Request): Promise<NextResponse> {
  const csrf = sameOriginGuard(req);
  if (csrf) return csrf;

  const body = await readJsonBody<SignInBody>(req);
  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: 'email and password are required' }, { status: 400 });
  }

  try {
    const result = await gatewayPost<SignInLaneResult>(
      '/auth/sign-in',
      { email: body.email, password: body.password, remember_me: Boolean(body.rememberMe) },
      null
    );
    if (result.mfaRequired || result.enrollmentRequired) {
      // No session exists to set — park the challenge in the HttpOnly cookie
      // (same name and shape the platform /2fa page reads) and let the two-factor
      // page finish it. The token never appears in the JSON body.
      const headers = new Headers();
      headers.append(
        'set-cookie',
        challengeCookie(String(result.userId), String(result.mfaChallengeToken))
      );
      return NextResponse.json({ mfaRequired: true }, { status: 200, headers });
    }
    if (!result.signedIn || !result.accessToken) {
      return NextResponse.json({ signedIn: false }, { status: 200 });
    }
    const headers = new Headers();
    headers.append(
      'set-cookie',
      sessionCookie(result.accessToken, maxAgeFromExpiresAt(result.accessTokenExpiresAt))
    );
    return NextResponse.json({ signedIn: true, userId: result.userId ?? null }, { headers });
  } catch (err) {
    if (err instanceof GatewayError) {
      return NextResponse.json({ error: err.code }, { status: err.status === 400 ? 400 : 502 });
    }
    throw err;
  }
}
