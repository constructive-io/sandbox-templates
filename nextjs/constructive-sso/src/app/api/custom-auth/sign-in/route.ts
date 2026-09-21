import { NextResponse } from 'next/server';

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
    if (result.mfaRequired) {
      // No session exists to set — the challenge token must never reach the
      // browser. A custom MFA completion lane is a follow-up milestone.
      return NextResponse.json(
        { mfaRequired: true, error: 'MFA_REQUIRED' },
        { status: 200 }
      );
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
