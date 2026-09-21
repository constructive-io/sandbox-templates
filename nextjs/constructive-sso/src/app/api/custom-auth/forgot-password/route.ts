import { NextResponse } from 'next/server';

import { readJsonBody, sameOriginGuard } from '@/lib/bff/request-guard';
import { GatewayError, gatewayPost } from '@/lib/sso/gateway';

interface ForgotPasswordBody {
  email?: string;
}

/**
 * POST /api/custom-auth/forgot-password — the recovery-request lane through
 * `auth_flows:forgot_password`. The lane always answers `requested:true`: an
 * unknown mailbox and a known one are indistinguishable by design.
 */
export async function POST(req: Request): Promise<NextResponse> {
  const csrf = sameOriginGuard(req);
  if (csrf) return csrf;

  const body = await readJsonBody<ForgotPasswordBody>(req);
  if (!body?.email) {
    return NextResponse.json({ error: 'email is required' }, { status: 400 });
  }

  try {
    const result = await gatewayPost<{ requested: boolean }>(
      '/auth/forgot-password',
      { email: body.email },
      null
    );
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof GatewayError) {
      return NextResponse.json({ error: err.code }, { status: err.status === 400 ? 400 : 502 });
    }
    throw err;
  }
}
