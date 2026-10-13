import { NextResponse } from 'next/server';

import { readJsonBody, sameOriginGuard } from '@/lib/bff/request-guard';
import { authClient, AuthGraphqlUnreachable, AuthRefusedUnnamed, AuthRefusal, runAuth } from '@/lib/sso/auth-graphql';

interface ForgotPasswordBody {
  email?: string;
}

/**
 * POST /api/custom-auth/forgot-password — the recovery request through the
 * tenant's `forgotPassword`. Always answers `requested:true`: an unknown
 * mailbox and a known one are indistinguishable by design, and a tenant
 * refusal (throttle) must not become an enumeration oracle either.
 */
export async function POST(req: Request): Promise<NextResponse> {
  const csrf = sameOriginGuard(req);
  if (csrf) return csrf;

  const body = await readJsonBody<ForgotPasswordBody>(req);
  if (!body?.email) {
    return NextResponse.json({ error: 'email is required' }, { status: 400 });
  }

  const db = authClient(req);
  try {
    await runAuth(db.mutation.forgotPassword({ input: { email: body.email } }, { select: {} }));
  } catch (err) {
    if (err instanceof AuthRefusedUnnamed || err instanceof AuthGraphqlUnreachable) {
      // The mailbox-or-not answer never depends on transport: silence here is
      // the anti-enumeration property the tenant itself keeps.
      console.warn('[forgot-password] auth surface failure answered as requested', {
        name: err instanceof Error ? err.name : typeof err
      });
    } else if (err instanceof AuthRefusal) {
      // A named refusal (the throttle) is still requested:true.
    }
    return NextResponse.json({ requested: true });
  }
  return NextResponse.json({ requested: true });
}
