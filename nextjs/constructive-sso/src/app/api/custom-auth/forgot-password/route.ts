import { NextResponse } from 'next/server';

import { readJsonBody, sameOriginGuard } from '@/lib/bff/request-guard';
import { AuthRefusal, authClient, runAuth } from '@/lib/sso/auth-graphql';

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
    if (err instanceof AuthRefusal) {
      return NextResponse.json({ requested: true });
    }
    throw err;
  }
  return NextResponse.json({ requested: true });
}
