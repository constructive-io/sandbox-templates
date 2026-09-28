import { NextResponse } from 'next/server';

import { sessionCredential } from '@/lib/sso/gateway';
import { GatewayError, gatewayPost } from '@/lib/sso/gateway';
import { readJsonBody, sameOriginGuard } from '@/lib/bff/request-guard';

/**
 * POST /api/auth/step-up/send — text the code a sensitive action demanded.
 * Authenticated: the session the request carries is the thing being re-verified.
 */
export async function POST(req: Request): Promise<NextResponse> {
  const csrf = sameOriginGuard(req);
  if (csrf) return csrf;
  await readJsonBody(req);

  try {
    const result = await gatewayPost<{ sent: boolean }>(
      '/auth/send-step-up-code',
      {},
      (await sessionCredential())
    );
    return NextResponse.json({ sent: result.sent === true });
  } catch (err) {
    if (err instanceof GatewayError) {
      return NextResponse.json({ error: err.code }, { status: err.status === 400 ? 400 : 502 });
    }
    throw err;
  }
}
