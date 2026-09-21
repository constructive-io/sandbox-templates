import { NextResponse } from 'next/server';

import { readJsonBody, sameOriginGuard } from '@/lib/bff/request-guard';
import { GatewayError, gatewayPost } from '@/lib/sso/gateway';

interface ResetPasswordBody {
  roleId?: string;
  resetToken?: string;
  newPassword?: string;
}

/**
 * POST /api/custom-auth/reset-password — spend a recovery token through
 * `auth_flows:reset_password`. `reset:false` covers wrong/spent/lapsed tokens
 * identically — which of the three is not a caller's business.
 */
export async function POST(req: Request): Promise<NextResponse> {
  const csrf = sameOriginGuard(req);
  if (csrf) return csrf;

  const body = await readJsonBody<ResetPasswordBody>(req);
  if (!body?.roleId || !body?.resetToken || !body?.newPassword) {
    return NextResponse.json(
      { error: 'roleId, resetToken and newPassword are required' },
      { status: 400 }
    );
  }

  try {
    const result = await gatewayPost<{ reset: boolean }>(
      '/auth/reset-password',
      { role_id: body.roleId, reset_token: body.resetToken, new_password: body.newPassword },
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
