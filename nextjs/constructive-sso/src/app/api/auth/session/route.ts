import { NextResponse } from 'next/server';

import { authClient, AuthGraphqlUnreachable, runAuth } from '@/lib/sso/auth-graphql';

export interface SessionResult {
  authenticated: boolean;
  userId?: string;
  username?: string;
  displayName?: string;
}

/**
 * POST /api/auth/session — who is this request, from the tenant's own
 * `currentUser` on the auth GraphQL. The HttpOnly constructive_session
 * cookie travels as the Bearer credential. A missing cookie, no user row,
 * or any tenant refusal all answer `authenticated:false` — the session probe
 * never 500s, because a dead session is an answer, not a fault.
 */
export async function POST(req: Request): Promise<NextResponse> {
  const db = authClient(req);
  try {
    const { currentUser } = await runAuth(
      db.query.currentUser({ select: { id: true, username: true, displayName: true } })
    );
    if (!currentUser) {
      return NextResponse.json({ authenticated: false });
    }
    return NextResponse.json({
      authenticated: true,
      userId: currentUser.id,
      username: currentUser.username ?? undefined,
      displayName: currentUser.displayName ?? undefined
    });
  } catch (err) {
    // No session, an expired one, a refusal: to the caller these are all
    // "not signed in". An unreachable tenant is the one worth knowing about
    // server-side, because every signed-in user of this deployment sees it.
    if (err instanceof AuthGraphqlUnreachable) {
      console.warn('[auth/session] tenant auth GraphQL unreachable', { detail: err.message });
    }
    return NextResponse.json({ authenticated: false });
  }
}
