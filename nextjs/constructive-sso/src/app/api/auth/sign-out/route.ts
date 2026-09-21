import { NextResponse } from 'next/server';

import { clearSessionCookie } from '@/lib/bff/session-cookie';
import { sameOriginGuard } from '@/lib/bff/request-guard';
import { gatewayPost, sessionCredential } from '@/lib/sso/gateway';

/**
 * POST /api/auth/sign-out — revoke the session at the gateway and expire the
 * cookie. The clear uses the shared cookie helper so the attributes always
 * match how the password sign-in route mints them.
 */
export async function POST(req: Request): Promise<NextResponse> {
  // State-changing POST: same-origin only, like the other auth routes.
  const csrf = sameOriginGuard(req);
  if (csrf) return csrf;

  const session = await sessionCredential();
  const result = await gatewayPost<{ signedOut: boolean }>('/auth/sign-out', {}, session);

  const headers = new Headers();
  headers.append('set-cookie', clearSessionCookie());
  return NextResponse.json({ signedOut: result.signedOut }, { headers });
}
