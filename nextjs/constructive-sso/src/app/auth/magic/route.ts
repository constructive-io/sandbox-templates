import { NextResponse } from 'next/server';

import { SSO_GATEWAY_URL } from '@/lib/sso/gateway';

/**
 * GET /auth/magic — send the browser to the page lane, not a rendering relay.
 *
 * A magic-link email builds its links on the site's canonical_url — this
 * app's origin — while the page that spends the token is mantra's
 * /auth/magic on the gateway. A relay that rendered the page here broke
 * both of its halves: the stylesheet answered 404 on this origin, and the
 * click's POST had to be forwarded by hand. A 302 to the gateway's own
 * page keeps the page whole — styled, posting to itself — and lands the
 * session cookie on the gateway host, which is the host the app shares
 * when gateway and app run on one cookie host (localhost).
 */
export async function GET(req: Request): Promise<NextResponse> {
  const query = new URL(req.url).search;
  return NextResponse.redirect(`${SSO_GATEWAY_URL}/auth/magic${query}`, 302);
}
