import { NextResponse } from 'next/server';

import { maxAgeFromExpiresAt, sessionCookie } from '@/lib/bff/session-cookie';
import { readJsonBody, sameOriginGuard } from '@/lib/bff/request-guard';
import { AuthRefusal, authClient, runAuth } from '@/lib/sso/auth-graphql';
import { SSO_GATEWAY_URL } from '@/lib/sso/gateway';

interface SignInBody {
  email?: string;
  password?: string;
  rememberMe?: boolean;
}

/**
 * POST /api/custom-auth/sign-in — the password lane through the tenant's
 * auth GraphQL (`signIn`).
 *
 * The tenant answers a wrong password with a null result — deliberately
 * indistinguishable from an unknown address. An MFA-enrolled account gets
 * `mfaRequired` and NO session here: the hosted `/login?next=%2F` owns the
 * challenge. A `require_mfa` tenant flags a factorless user with
 * `mfaSetupRequired`: the session IS minted, and the browser is sent to the
 * hosted `/setup-2fa` in required mode. The access token never appears in
 * the response body.
 */
export async function POST(req: Request): Promise<NextResponse> {
  const csrf = sameOriginGuard(req);
  if (csrf) return csrf;

  const body = await readJsonBody<SignInBody>(req);
  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: 'email and password are required' }, { status: 400 });
  }

  const db = authClient(req);
  try {
    const { signIn } = await runAuth(
      db.mutation.signIn(
        {
          input: {
            email: body.email,
            password: body.password,
            rememberMe: body.rememberMe === true,
            // The cookie lane's credential, not an API client's bearer.
            credentialKind: 'access_token'
          }
        },
        {
          select: {
            result: {
              select: {
                userId: true,
                accessToken: true,
                accessTokenExpiresAt: true,
                deviceApprovalRequired: true,
                mfaRequired: true,
                mfaSetupRequired: true
              }
            }
          }
        }
      )
    );
    const result = signIn?.result ?? null;

    if (result?.deviceApprovalRequired) {
      return NextResponse.json({ error: 'DEVICE_APPROVAL_REQUIRED' }, { status: 200 });
    }
    if (result?.mfaRequired) {
      // No session exists to set — the challenge is the hosted /login's to
      // spend, and the challenge token must never reach the browser.
      return NextResponse.json(
        {
          mfaRequired: true,
          error: 'MFA_REQUIRED',
          next: `${SSO_GATEWAY_URL}/login?next=%2F`
        },
        { status: 200 }
      );
    }
    if (!result?.accessToken) {
      return NextResponse.json({ signedIn: false }, { status: 200 });
    }

    const headers = new Headers();
    headers.append(
      'set-cookie',
      sessionCookie(result.accessToken, maxAgeFromExpiresAt(result.accessTokenExpiresAt))
    );

    if (result.mfaSetupRequired) {
      // The session is minted — force means "set up before anything else",
      // not "stay out" — and the hosted setup page owns the enrollment.
      return NextResponse.json(
        {
          signedIn: true,
          userId: result.userId ?? null,
          next: `${SSO_GATEWAY_URL}/setup-2fa?next=%2F&required=1`
        },
        { headers }
      );
    }
    return NextResponse.json(
      { signedIn: true, userId: result.userId ?? null },
      { headers }
    );
  } catch (err) {
    if (err instanceof AuthRefusal) {
      return NextResponse.json({ error: err.code }, { status: err.status });
    }
    throw err;
  }
}
