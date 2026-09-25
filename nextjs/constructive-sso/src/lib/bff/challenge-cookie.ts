import 'server-only';

/**
 * The pending MFA challenge, held server-side for the browser.
 *
 * `constructive_mfa` is the same name the platform's own /2fa page uses
 * (compute/lib/auth-browser), with the same `userId:token` value and the same
 * ten-minute lifetime as the server-side challenge state — so a challenge this
 * app's sign-in started can also be finished on the platform page, and vice
 * versa, on one hostname. HttpOnly: the token never reaches page JavaScript,
 * exactly as it never appears in the sign-in JSON body.
 */
export const CHALLENGE_COOKIE = 'constructive_mfa';

const CHALLENGE_SECONDS = 600;

function attrs(maxAge: number): string {
  return [
    `Path=/`,
    `HttpOnly`,
    `SameSite=Lax`,
    `Max-Age=${maxAge}`,
    process.env.NODE_ENV === 'production' ? `Secure` : null,
  ]
    .filter((a): a is string => a !== null)
    .join('; ');
}

/** The Set-Cookie value that parks a challenge the sign-in just raised. */
export function challengeCookie(userId: string, mfaChallengeToken: string): string {
  return `${CHALLENGE_COOKIE}=${encodeURIComponent(`${userId}:${mfaChallengeToken}`)}; ${attrs(
    CHALLENGE_SECONDS
  )}`;
}

/** Same attributes, empty, expired — spends or abandons the challenge. */
export function clearChallengeCookie(): string {
  return `${CHALLENGE_COOKIE}=; ${attrs(0)}`;
}

/** Parse the parked challenge, or null when none is present. */
export function readChallengeCookie(cookieHeader: string | null): {
  userId: string;
  mfaChallengeToken: string;
} | null {
  if (!cookieHeader) return null;
  const raw = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${CHALLENGE_COOKIE}=`))
    ?.slice(CHALLENGE_COOKIE.length + 1);
  if (!raw) return null;
  const value = decodeURIComponent(raw);
  const separator = value.indexOf(':');
  if (separator <= 0) return null;
  return { userId: value.slice(0, separator), mfaChallengeToken: value.slice(separator + 1) };
}
