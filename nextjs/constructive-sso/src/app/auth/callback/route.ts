import { NextResponse } from 'next/server';

import { gatewayLocation, SSO_GATEWAY_URL } from '@/lib/sso/gateway';

/**
 * GET /auth/callback — the identity provider's return leg, relayed to the
 * cloud function's page lane.
 *
 * The provider's registered redirect URI is
 * `http://localhost:3000/auth/callback` (the app's own origin). mantra's
 * oauth_start composes it from the site's canonical_url; the provider returns
 * here, and this route bridges to the cloud function's callback at
 * `${SSO_GATEWAY_URL}/auth/callback`. The raw query (`code`, `state`,
 * provider errors) is forwarded with `redirect: 'manual'`, and the upstream
 * 302 + every `Set-Cookie` value is relayed so the browser lands with its
 * session cookie — the session token never touches client JavaScript. The
 * 302's `Location` is a path on the GATEWAY (mantra's `/`, `/2fa`,
 * `/setup-2fa`, `/login?error=…`), so it is made absolute against the gateway
 * before it is relayed; verbatim, the browser resolved it against this app
 * and `/setup-2fa` answered 404.
 *
 * NOTE: this is a route handler, not a page. The old session-hydration page at
 * this path was removed — the upstream 302 to `next` plus the app's
 * trySessionAuth-on-mount replace it.
 */
export async function GET(req: Request): Promise<NextResponse> {
  const query = new URL(req.url).search;
  const upstreamUrl = `${SSO_GATEWAY_URL}/auth/callback${query}`;
  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, {
      method: 'GET',
      redirect: 'manual',
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return new NextResponse(
      `SSO gateway unreachable at ${SSO_GATEWAY_URL}/auth/callback — ${detail}`,
      { status: 502, headers: { 'content-type': 'text/plain; charset=utf-8' } }
    );
  }

  const headers = new Headers();
  const location = upstream.headers.get('location');
  if (location) headers.set('location', gatewayLocation(location, upstreamUrl));
  const contentType = upstream.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);
  for (const cookie of upstream.headers.getSetCookie()) {
    headers.append('set-cookie', cookie);
  }

  const isRedirect = upstream.status >= 300 && upstream.status < 400;
  const body = isRedirect ? null : Buffer.from(await upstream.arrayBuffer());
  return new NextResponse(body, { status: upstream.status, headers });
}
