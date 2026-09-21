import { NextResponse } from 'next/server';

import { SSO_GATEWAY_URL } from '@/lib/sso/gateway';

/**
 * GET /auth/custom-callback — the identity provider's return leg for the
 * CUSTOM-UI flow, relayed to the `sso:callback` page lane.
 *
 * Same verbatim-relay contract as the mantra relay at /auth/callback (which
 * stays untouched): forward the raw query (`code`, `state`, provider errors),
 * capture the upstream 302 with `redirect: 'manual'`, and relay its location
 * plus every `Set-Cookie` value so the session cookie lands on the app origin
 * without the token ever touching client JavaScript.
 *
 * Two outcomes travel back through this relay:
 *   • 302 with a session cookie — sign-in (or sign-up) completed; the browser
 *     lands on the `return_to` path.
 *   • 302 with `?link_ticket=…` and NO cookie — the provider identity maps to
 *     an email an existing account owns; the completion UI must authenticate
 *     that account before POST /api/sso/link can spend the ticket.
 */
export async function GET(req: Request): Promise<NextResponse> {
  const query = new URL(req.url).search;
  let upstream: Response;
  try {
    upstream = await fetch(`${SSO_GATEWAY_URL}/sso/callback${query}`, {
      method: 'GET',
      redirect: 'manual',
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return new NextResponse(
      `SSO gateway unreachable at ${SSO_GATEWAY_URL}/sso/callback — ${detail}`,
      { status: 502, headers: { 'content-type': 'text/plain; charset=utf-8' } }
    );
  }

  const headers = new Headers();
  const location = upstream.headers.get('location');
  if (location) headers.set('location', location);
  const contentType = upstream.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);
  for (const cookie of upstream.headers.getSetCookie()) {
    headers.append('set-cookie', cookie);
  }

  const isRedirect = upstream.status >= 300 && upstream.status < 400;
  const body = isRedirect ? null : Buffer.from(await upstream.arrayBuffer());
  return new NextResponse(body, { status: upstream.status, headers });
}
