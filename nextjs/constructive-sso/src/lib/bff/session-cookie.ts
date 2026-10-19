import 'server-only';

/**
 * Central session-cookie policy for every BFF route that mints or retires the
 * app session.
 *
 * The OAuth callback relay forwards the platform-generated Set-Cookie
 * verbatim — its attributes are the tenant auth settings' decision. The
 * PASSWORD lanes are different: the sync lane answers JSON, so the BFF
 * constructs the cookie itself, and the rules must live in exactly one place
 * (the sign-out route clears with the same helper — duplicated attribute
 * strings are how `Path` drift happens).
 *
 * `constructive_session` is the name the platform's sync-auth layer reads and
 * the same one the callback relay forwards (compute-types SESSION_COOKIE).
 * Host-scoped: it is shared across ports on one hostname — which is exactly
 * what glues the gateway origin and this app origin together in local dev.
 */
export const SESSION_COOKIE = 'constructive_session';

/**
 * The trusted-device cookie — the same name and lifetime the platform's page
 * lane writes (compute-runtime DEVICE_COOKIE), so a browser this BFF signed
 * in is recognised by the hosted pages too. Cookies ignore port, and both
 * cookies are host-only on `localhost`.
 */
export const DEVICE_COOKIE = 'constructive_device_token';

/** Fallback lifetime when the lane answers no expiry (matches platform defaults). */
const DEFAULT_MAX_AGE_SECONDS = 60 * 60 * 24 * 14;

/** A device outlives any one session it signed in (matches compute-runtime). */
const DEVICE_MAX_AGE_SECONDS = 90 * 24 * 60 * 60;

function attrs(maxAge: number): string {
  return [
    `Path=/`,
    `HttpOnly`,
    `SameSite=Lax`,
    `Max-Age=${maxAge}`,
    // Local dev runs plain http on localhost — Secure would drop the cookie.
    process.env.NODE_ENV === 'production' ? `Secure` : null,
  ]
    .filter((a): a is string => a !== null)
    .join('; ');
}

/** Seconds from now until `accessTokenExpiresAt` (ISO), floored at 0. */
export function maxAgeFromExpiresAt(expiresAt?: string | null): number {
  if (!expiresAt) return DEFAULT_MAX_AGE_SECONDS;
  const ms = Date.parse(expiresAt) - Date.now();
  if (!Number.isFinite(ms)) return DEFAULT_MAX_AGE_SECONDS;
  return Math.max(0, Math.floor(ms / 1000));
}

/** The Set-Cookie value that mints the app session. */
export function sessionCookie(accessToken: string, maxAgeSeconds: number): string {
  return `${SESSION_COOKIE}=${encodeURIComponent(accessToken)}; ${attrs(maxAgeSeconds)}`;
}

/** The Set-Cookie value that retires it — same attributes, empty, expired. */
export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; ${attrs(0)}`;
}

/**
 * The Set-Cookie value that keeps a trusted-device token the tenant handed
 * back at sign-in. HttpOnly like the session cookie: the token is opaque and
 * no page script has a use for it.
 */
export function deviceCookie(token: string): string {
  return `${DEVICE_COOKIE}=${encodeURIComponent(token)}; ${attrs(DEVICE_MAX_AGE_SECONDS)}`;
}
