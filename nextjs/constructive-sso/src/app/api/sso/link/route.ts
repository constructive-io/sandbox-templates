import { NextResponse } from 'next/server';

import { readJsonBody, sameOriginGuard } from '@/lib/bff/request-guard';
import { GatewayError, gatewayPost, sessionCredential } from '@/lib/sso/gateway';

interface LinkBody {
  ticket?: string;
}

interface LinkResult {
  linked: boolean;
  provider: string;
  email: string | null;
}

/**
 * POST /api/sso/link — spend a link ticket against the CALLER'S OWN session.
 *
 * The ticket arrived as `?link_ticket=` on the callback redirect, carried by
 * an UNauthenticated browser: the provider proved control of a mailbox that
 * already belongs to an account, and the platform refused to sign in without
 * that account's consent. Spending requires being signed in AS that account —
 * the lane verifies the session owns the ticket's email (`ownsEmail`) and may
 * answer `STEP_UP_REQUIRED` if the session has not proven itself recently.
 * A confirmation button with no session is not consent; authenticate first.
 */
export async function POST(req: Request): Promise<NextResponse> {
  const csrf = sameOriginGuard(req);
  if (csrf) return csrf;

  const body = await readJsonBody<LinkBody>(req);
  if (!body?.ticket) {
    return NextResponse.json({ error: 'ticket is required' }, { status: 400 });
  }
  const session = await sessionCredential();
  if (!session) {
    return NextResponse.json({ error: 'sign in to the existing account first' }, { status: 401 });
  }

  try {
    const result = await gatewayPost<LinkResult>('/auth/link', { ticket: body.ticket }, session);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof GatewayError) {
      // The lane's refusals are answers the UI can name — surface the code.
      return NextResponse.json({ error: err.code }, { status: err.status });
    }
    throw err;
  }
}
