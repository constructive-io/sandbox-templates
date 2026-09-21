import { NextResponse } from 'next/server';

import { readJsonBody, sameOriginGuard } from '@/lib/bff/request-guard';
import { APP_ORIGIN, GatewayError, gatewayPost } from '@/lib/sso/gateway';

interface StartBody {
  provider?: string;
  returnTo?: string;
}

/**
 * The provider's redirect target for the custom-UI flow: this app's own relay
 * at `/auth/custom-callback`, which bridges to the gateway's `sso:callback`
 * page and relays the platform's Set-Cookie onto the app origin. Constructed
 * server-side and constant — the browser names only the provider and where it
 * wants to land afterwards.
 */
const CUSTOM_REDIRECT_URI = `${APP_ORIGIN}/auth/custom-callback`;

/**
 * POST /api/sso/start — begin an authorization-code flow through the
 * `sso:start` sync lane.
 *
 * The lane mints state/PKCE/nonce with the platform and answers the authorize
 * URL as data; the client navigates the browser there. Errors from the lane
 * (unknown provider, disabled) map to a small BFF-facing surface — the code
 * travels, the gateway body never does.
 */
export async function POST(req: Request): Promise<NextResponse> {
  const csrf = sameOriginGuard(req);
  if (csrf) return csrf;

  const body = await readJsonBody<StartBody>(req);
  if (!body) {
    return NextResponse.json({ error: 'invalid JSON body' }, { status: 400 });
  }
  const provider = body.provider;
  if (!provider) {
    return NextResponse.json({ error: 'provider is required' }, { status: 400 });
  }
  // Where the callback relay sends the browser AFTER the platform answers:
  // always the completion page, which either forwards a signed-in browser to
  // `next` or — when the answer was a link ticket rather than a session —
  // walks the owner of the existing account through authenticating and
  // spending the ticket. Local path only; an absolute returnTo would be an
  // open redirect, and safeTarget on the platform side refuses one anyway.
  const next = body.returnTo ?? '/';
  if (!next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) {
    return NextResponse.json({ error: 'returnTo must be a local path' }, { status: 400 });
  }
  const returnTo = `/auth/custom-complete?next=${encodeURIComponent(next)}`;

  try {
    const result = await gatewayPost<{ location: string; state: string }>(
      '/start',
      { provider, redirect_uri: CUSTOM_REDIRECT_URI, return_to: returnTo },
      null
    );
    return NextResponse.json({ location: result.location, state: result.state });
  } catch (err) {
    if (err instanceof GatewayError) {
      return NextResponse.json({ error: err.code }, { status: err.status === 400 ? 400 : 502 });
    }
    throw err;
  }
}
