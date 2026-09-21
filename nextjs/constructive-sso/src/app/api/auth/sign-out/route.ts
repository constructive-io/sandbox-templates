import { NextResponse } from 'next/server';

import { clearSessionCookie } from '@/lib/bff/session-cookie';
import { gatewayPost, sessionCredential } from '@/lib/sso/gateway';

/**
 * POST /api/auth/sign-out — revoke the session at the gateway and expire the
 * cookie. The clear uses the shared cookie helper so the attributes always
 * match how the password sign-in route mints them.
 */
export async function POST(): Promise<NextResponse> {
  const session = await sessionCredential();
  const result = await gatewayPost<{ signedOut: boolean }>('/auth/sign-out', {}, session);

  const headers = new Headers();
  headers.append('set-cookie', clearSessionCookie());
  return NextResponse.json({ signedOut: result.signedOut }, { headers });
}
