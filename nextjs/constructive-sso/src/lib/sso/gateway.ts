/**
 * sso/gateway — server-only gateway client for the SSO cloud functions.
 *
 * The browser never talks to the compute sync gateway directly: every call
 * goes through these helpers (a Next.js route handler), which forward the
 * HttpOnly `constructive_session` cookie as `Authorization: Bearer`. That is
 * also the gateway's own session cookie name (compute-types SESSION_COOKIE) —
 * host-scoped on localhost, so both origins see it.
 *
 * Server-only: never import from a client component.
 */

import 'server-only';

import { cookies } from 'next/headers';

const SESSION_COOKIE = 'constructive_session';

/** Base URL of the compute sync gateway (Traefik → compute-sync). */
export const SSO_GATEWAY_URL = (process.env.SSO_GATEWAY_URL ?? 'http://localhost').replace(/\/$/, '');

/** The app's own origin — where the provider's redirect lands (must be `localhost`). */
export const APP_ORIGIN = process.env.APP_ORIGIN ?? 'http://localhost:3000';

/** A local path the callback may send the browser to (`/…`, never `//…` or `/\\…`). */
export function isLocalPath(value: string): boolean {
  return value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/\\') && !value.includes('\\');
}

/** The session credential the request carries, if any (cookie → bearer value). */
export async function sessionCredential(): Promise<string | null> {
  const store = await cookies();
  const value = store.get(SESSION_COOKIE)?.value;
  return value || null;
}

/** A gateway refusal with its own code, or a transport failure below it. */
export class GatewayError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

/** POST a JSON body to the gateway and unwrap the `{ok, result}` envelope.
 *
 * Throws {@link GatewayError} for an envelope refusal (carrying the lane's
 * error code) and for transport failures (HTTP-level or timeout) — callers
 * map those to BFF statuses, never to browser-visible bodies (a body can
 * carry credentials).
 */
export async function gatewayPost<T = unknown>(path: string, body: unknown, session: string | null): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${SSO_GATEWAY_URL}${path}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(session ? { authorization: `Bearer ${session}` } : {}),
      },
      body: JSON.stringify(body),
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw new GatewayError(`gateway ${path} unreachable — ${detail}`, 'GATEWAY_UNREACHABLE', 502);
  }
  // The envelope is the contract; a non-JSON answer means the gateway itself
  // is misbehaving (proxy error page, crash) — surface it as its own class.
  let payload: { ok: boolean; result?: T; error?: { message?: string; code?: string } };
  try {
    payload = (await res.json()) as typeof payload;
  } catch {
    throw new GatewayError(`gateway ${path} answered HTTP ${res.status} with a non-JSON body`, 'GATEWAY_BAD_RESPONSE', 502);
  }
  if (!payload.ok) {
    throw new GatewayError(
      payload.error?.message ?? `gateway ${path} failed with HTTP ${res.status}`,
      payload.error?.code ?? 'GATEWAY_ERROR',
      res.status
    );
  }
  return payload.result as T;
}
