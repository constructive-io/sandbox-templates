import { NextResponse } from 'next/server';

import { readJsonBody, sameOriginGuard } from '@/lib/bff/request-guard';
import { authClient, AuthGraphqlUnreachable, AuthRefusedUnnamed, runAuth } from '@/lib/sso/auth-graphql';

interface ResetPasswordBody {
  roleId?: string;
  resetToken?: string;
  newPassword?: string;
}

/**
 * POST /api/custom-auth/reset-password — spend a recovery token through the
 * tenant's `resetPassword`. `reset:false` covers wrong/spent/lapsed tokens
 * identically — which of the three is not a caller's business. A tenant
 * refusal (a throttled spend, a policy the new password breaks) answers
 * `reset:false` for the same reason: the difference is the tenant's to know.
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

  // Anonymous lane: no session forwarded — a stale cookie must not
  // poison a mutation that needs no session (see authClient).
  const db = authClient(req, { anonymous: true });
  try {
    const { resetPassword } = await runAuth(
      db.mutation.resetPassword(
        {
          input: {
            roleId: body.roleId,
            resetToken: body.resetToken,
            newPassword: body.newPassword
          }
        },
        { select: { result: true } }
      )
    );
    return NextResponse.json({ reset: resetPassword?.result === true });
  } catch (err) {
    if (err instanceof AuthRefusedUnnamed || err instanceof AuthGraphqlUnreachable) {
      console.warn('[reset-password] auth surface failure answered as reset:false', {
        name: err instanceof Error ? err.name : typeof err
      });
    }
    // Every refusal — named, unnamed, transport — is reset:false: the
    // difference between them is the tenant's to keep.
    return NextResponse.json({ reset: false });
  }
}
