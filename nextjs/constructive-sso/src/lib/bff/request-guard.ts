import 'server-only';

import { NextResponse } from 'next/server';

import { APP_ORIGIN } from '@/lib/sso/gateway';

/**
 * Shared BFF request plumbing for the custom-auth routes.
 *
 * Every state-changing BFF route runs the same-origin guard: a cross-site
 * attacker who can submit credentials on a victim's browser can otherwise
 * mint a session for an account the ATTACKER controls (login CSRF). Browsers
 * send `Origin` on POSTs; a mismatched one is refused before any credential
 * work happens. A missing Origin is not a browser — no ambient-credential
 * CSRF vector — and is allowed (tests, curl).
 */
export function sameOriginGuard(req: Request): NextResponse | null {
  const origin = req.headers.get('origin');
  if (!origin) return null;
  if (origin !== APP_ORIGIN) {
    return NextResponse.json(
      { error: 'cross-origin request refused' },
      { status: 403 }
    );
  }
  return null;
}

/** Parse the JSON body, answering `null` for malformed input (caller 400s). */
export async function readJsonBody<T>(req: Request): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}
