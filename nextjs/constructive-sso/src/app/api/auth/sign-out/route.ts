import { NextResponse } from 'next/server';

import { clearSessionCookie } from '@/lib/bff/session-cookie';
import { sameOriginGuard } from '@/lib/bff/request-guard';
import { authClient, runAuth } from '@/lib/sso/auth-graphql';

/**
 * POST /api/auth/sign-out — revoke the session at the tenant's auth GraphQL
 * and expire the cookie. The cookie is cleared whatever the call answers: a
 * session that is already gone refuses the sign-out, and the browser should
 * still end up signed out. The clear uses the shared cookie helper so the
 * attributes always match how the sign-in route mints them.
 */
export async function POST(req: Request): Promise<NextResponse> {
  // State-changing POST: same-origin only, like the other auth routes.
  const csrf = sameOriginGuard(req);
  if (csrf) return csrf;

  const db = authClient(req);
  try {
    await runAuth(db.mutation.signOut({ input: {} }, { select: { clientMutationId: true } }));
  } catch {
    // Already-revoked, expired, or unreachable — the cookie clears either way.
  }

  const headers = new Headers();
  headers.append('set-cookie', clearSessionCookie());
  return NextResponse.json({ signedOut: true }, { headers });
}
