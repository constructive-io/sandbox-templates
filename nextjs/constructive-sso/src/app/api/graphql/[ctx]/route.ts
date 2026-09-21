import { NextResponse } from 'next/server';

import { sessionCredential } from '@/lib/sso/gateway';

/**
 * POST /api/graphql/[ctx] — same-origin GraphQL proxy for SSO sessions.
 *
 * The session cookie is host-only on `localhost`, so it never reaches the
 * `*-{db}.localhost` hosts the SDK targets directly. This route forwards the
 * request to a server-owned allowlisted upstream with the session as a Bearer
 * credential — the credential itself never leaves the server.
 */
const UPSTREAMS: Record<string, string | undefined> = {
  admin: process.env.GRAPHQL_ADMIN_URL,
  auth: process.env.GRAPHQL_AUTH_URL,
  app: process.env.GRAPHQL_APP_URL,
};

export async function POST(
  req: Request,
  ctx: { params: Promise<{ ctx: string }> }
): Promise<NextResponse> {
  const { ctx: context } = await ctx.params;
  const upstream = UPSTREAMS[context];
  if (!upstream) {
    return NextResponse.json({ error: `unknown GraphQL context '${context}'` }, { status: 404 });
  }

  const session = await sessionCredential();
  const body = await req.text();
  const res = await fetch(upstream, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(session ? { authorization: `Bearer ${session}` } : {}),
    },
    body,
    cache: 'no-store',
  });

  return new NextResponse(Buffer.from(await res.arrayBuffer()), {
    status: res.status,
    headers: { 'content-type': res.headers.get('content-type') ?? 'application/json' },
  });
}
