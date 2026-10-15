import { NextResponse } from 'next/server';

import { gatewayLocation, SSO_GATEWAY_URL } from '@/lib/sso/gateway';

/**
 * GET /auth/magic — a magic-link email's landing, relayed to the page lane.
 *
 * The emails the tenant sends build their links on the site's canonical_url —
 * this app's origin — so the magic link names `http://localhost:3000/auth/magic?...`
 * while the page that spends the token is mantra's `/auth/magic` on the
 * gateway. This route is the same verbatim relay `/auth/callback` is: the raw
 * query (the single-use token, `next`) is forwarded with `redirect: 'manual'`,
 * and the upstream 302 plus every `Set-Cookie` value comes back so the browser
 * lands signed in — the session token never touches client JavaScript. The
 * 302's `Location` is a path on the GATEWAY, so it is made absolute against
 * the gateway before it is relayed.
 */
export async function GET(req: Request): Promise<NextResponse> {
  const query = new URL(req.url).search;
  const upstreamUrl = `${SSO_GATEWAY_URL}/auth/magic${query}`;
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
      `SSO gateway unreachable at ${SSO_GATEWAY_URL}/auth/magic — ${detail}`,
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
