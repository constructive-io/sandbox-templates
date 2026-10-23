import { NextResponse } from 'next/server';

import { clearSessionCookie } from '@/lib/bff/session-cookie';
import { sameOriginGuard } from '@/lib/bff/request-guard';
import { authClient, AuthGraphqlUnreachable, runAuth, sessionCookieOf } from '@/lib/sso/auth-graphql';

/**
 * POST /api/auth/sign-out — revoke the session at the tenant's auth GraphQL
 * and expire the cookie. This is the whole sign-out: since the gateway's GET
 * /logout only asks "Sign out?" (CSRF-checked POST to its own form), nothing
 * behind this route ends the session if it does not.
 *
 * - No session cookie, or the tenant refuses (already revoked, expired): the
 *   browser is signed out — clear the cookie, answer `signedOut`.
 * - The tenant is unreachable: the session is still live. Keep the cookie so a
 *   retry can revoke it, and answer 502 so the app says so instead of showing
 *   the sign-in page over a live session. The clear uses the shared cookie
 *   helper so the attributes match how the sign-in route mints them.
 */
export async function POST(req: Request): Promise<NextResponse> {
  // State-changing POST: same-origin only, like the other auth routes.
  const csrf = sameOriginGuard(req);
  if (csrf) return csrf;

  if (sessionCookieOf(req)) {
    const db = authClient(req);
    try {
      await runAuth(db.mutation.signOut({ input: {} }, { select: { clientMutationId: true } }));
    } catch (err) {
      if (err instanceof AuthGraphqlUnreachable) {
        console.warn('[auth/sign-out] tenant auth GraphQL unreachable', { detail: err.message });
        return NextResponse.json({ signedOut: false, error: err.code }, { status: err.status });
      }
      // A refusal: the session is already gone, which is what the caller asked for.
    }
  }

  const headers = new Headers();
  headers.append('set-cookie', clearSessionCookie());
  return NextResponse.json({ signedOut: true }, { headers });
}
