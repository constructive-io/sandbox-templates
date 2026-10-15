import { NextResponse } from 'next/server';

import { deviceCookie, maxAgeFromExpiresAt, sessionCookie } from '@/lib/bff/session-cookie';
import { readJsonBody, sameOriginGuard } from '@/lib/bff/request-guard';
import { authClient, authErrorResponse, deviceTokenOf, GATEWAY_ORIGIN, runAuth } from '@/lib/sso/auth-graphql';

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
 *
 * Trusted devices (upstream #2199): the tenant can hand back a device token
 * with any outcome — it is kept as the `constructive_device_token` cookie
 * (the name and 90-day lifetime the hosted pages write), and a token this
 * browser already holds is fed back as `deviceToken` so the tenant
 * recognises it at the next sign-in.
 */
export async function POST(req: Request): Promise<NextResponse> {
  const csrf = sameOriginGuard(req);
  if (csrf) return csrf;

  const body = await readJsonBody<SignInBody>(req);
  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: 'email and password are required' }, { status: 400 });
  }

  const device = deviceTokenOf(req);
  // Anonymous lane: no session forwarded — a stale cookie must not
  // poison a mutation that needs no session (see authClient).
  const db = authClient(req, { anonymous: true });
  try {
    const { signIn } = await runAuth(
      db.mutation.signIn(
        {
          input: {
            email: body.email,
            password: body.password,
            rememberMe: body.rememberMe === true,
            // The cookie lane's credential, not an API client's bearer.
            credentialKind: 'access_token',
            // The trusted-device token an earlier sign-in left, when present.
            ...(device ? { deviceToken: device } : {})
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
                mfaSetupRequired: true,
                outDeviceToken: true
              }
            }
          }
        }
      )
    );
    const result = signIn?.result ?? null;

    // A device token is kept whatever the outcome — including for a device
    // that still needs approval, which would otherwise be a stranger again
    // at the next sign-in.
    const deviceHeaders = (): Headers => {
      const headers = new Headers();
      if (result?.outDeviceToken) {
        headers.append('set-cookie', deviceCookie(result.outDeviceToken));
      }
      return headers;
    };

    if (result?.deviceApprovalRequired) {
      return NextResponse.json(
        { error: 'DEVICE_APPROVAL_REQUIRED' },
        { status: 200, headers: deviceHeaders() }
      );
    }
    if (result?.mfaRequired) {
      // No session exists to set — the challenge is the hosted /login's to
      // spend, and the challenge token must never reach the browser.
      return NextResponse.json(
        {
          mfaRequired: true,
          error: 'MFA_REQUIRED',
          next: `${GATEWAY_ORIGIN}/login?next=%2F`
        },
        { status: 200, headers: deviceHeaders() }
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
    if (result.outDeviceToken) {
      headers.append('set-cookie', deviceCookie(result.outDeviceToken));
    }

    if (result.mfaSetupRequired) {
      // The session is minted — force means "set up before anything else",
      // not "stay out" — and the hosted setup page owns the enrollment.
      return NextResponse.json(
        {
          signedIn: true,
          userId: result.userId ?? null,
          next: `${GATEWAY_ORIGIN}/setup-2fa?next=%2F&required=1`
        },
        { headers }
      );
    }
    return NextResponse.json(
      { signedIn: true, userId: result.userId ?? null },
      { headers }
    );
  } catch (err) {
    return authErrorResponse(err);
  }
}
