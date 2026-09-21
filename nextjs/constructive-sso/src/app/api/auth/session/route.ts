import { NextResponse } from 'next/server';

import { gatewayPost, sessionCredential } from '@/lib/sso/gateway';

export interface SessionResult {
  authenticated: boolean;
  userId?: string;
  username?: string;
  displayName?: string;
  databaseId?: string;
  tenant?: string;
}

/**
 * POST /api/auth/session — who is this request, from the tenant's own
 * who-am-i. The HttpOnly constructive_session cookie travels as a Bearer
 * credential; a missing/expired/revoked session answers `authenticated:false`
 * (the who-am-i lane is deliberately anonymous-safe).
 */
export async function POST(): Promise<NextResponse> {
  const session = await sessionCredential();
  const result = await gatewayPost<SessionResult>('/auth/who-am-i', {}, session);
  return NextResponse.json(result);
}
