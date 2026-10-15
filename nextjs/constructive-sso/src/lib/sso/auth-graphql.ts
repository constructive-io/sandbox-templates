/**
 * sso/auth-graphql — server-only client for the tenant's auth GraphQL.
 *
 * Auth is GraphQL-only on main: the JSON `auth_flows:*` lane is deleted, so
 * the BFF routes call the same generated surface the hosted pages use, at
 * `GRAPHQL_AUTH_URL` (the tenant's `auth-<slug>.localhost` host). The client
 * is the committed SDK under `src/graphql/sdk/auth/orm` — never a hand-rolled
 * query string — created per request because its headers are per request:
 *
 *   Authorization: Bearer <constructive_session cookie>, when one is carried;
 *   user-agent / origin: forwarded unchanged from the incoming request.
 *
 * The header forwarding is not decoration. Sessions record the user agent and
 * origin they were minted under, and `verifyStepUpCode` compares them later —
 * a server fetch's default `User-Agent: node` would fail that comparison for
 * every step-up.
 *
 * Errors are two kinds, by construction:
 *
 *   - transport: the fetch threw (refused, timeout) or answered non-2xx —
 *     infrastructure, surfaced as {@link AuthGraphqlUnreachable} (502
 *     AUTH_GRAPHQL_UNREACHABLE). The SDK's adapter folds HTTP-status failures
 *     into the same `errors[]` shape as GraphQL refusals, so the custom fetch
 *     below throws on non-2xx *before* the adapter can conflate the two.
 *   - refusal: a GraphQL error whose message IS the tenant's code
 *     (STEP_UP_SESSION_INVALID, TOO_MANY_REQUESTS, …), surfaced as
 *     {@link AuthRefusal} with that code.
 *
 * Never logged: tokens, request bodies. Neither appears in these errors.
 */

import 'server-only';

import { NextResponse } from 'next/server';

import { createClient } from '@/graphql/sdk/auth/orm';
import type { QueryBuilder, QueryResult } from '@/graphql/sdk/auth/orm';

/** The tenant's auth GraphQL endpoint, from the environment the bring-up wrote. */
const endpoint = (process.env.GRAPHQL_AUTH_URL ?? '').replace(/\/$/, '');

/** The platform's session cookie — the same name the gateway mints. */
const SESSION_COOKIE = 'constructive_session';

/** Everything the tenant may spend on one call: 10 seconds, then a 502. */
const TIMEOUT_MS = 10_000;

/** Transport-level failure: the tenant's auth surface was not reachable. */
export class AuthGraphqlUnreachable extends Error {
  readonly code = 'AUTH_GRAPHQL_UNREACHABLE';
  readonly status = 502;

  constructor(detail: string) {
    super(`auth GraphQL unreachable — ${detail}`);
    this.name = 'AuthGraphqlUnreachable';
  }
}

/** A refusal the tenant raised; `code` is its own name for the refusal. */
export class AuthRefusal extends Error {
  constructor(
    readonly code: string,
    readonly status = statusForCode(code)
  ) {
    super(code);
    this.name = 'AuthRefusal';
  }
}

/**
 * A refusal the platform could not name in a code the BFF knows: a surface
 * error whose message is prose ("permission denied for function …"). Answered
 * to the caller as the generic AUTH_REFUSED, logged server-side so the
 * operator sees what the tenant actually said — message only, never a token
 * or a request body (neither is in scope here).
 */
export class AuthRefusedUnnamed extends Error {
  readonly code = 'AUTH_REFUSED';
  readonly status = 400;

  constructor(detail: string) {
    super('AUTH_REFUSED');
    this.name = 'AuthRefusedUnnamed';
    console.warn('[auth-graphql] tenant refused without a known code', { detail });
  }
}

/** The 4xx a tenant refusal maps to; anything unnamed is a plain 400. */
function statusForCode(code: string): number {
  if (code === 'NOT_AUTHENTICATED') return 401;
  if (code === 'STEP_UP_SESSION_INVALID') return 401;
  if (code === 'TOO_MANY_REQUESTS') return 429;
  return 400;
}

/** A tenant code: SCREAMING_SNAKE, as the platform's errors.raise_error writes them. */
const CODE_SHAPE = /^[A-Z][A-Z0-9_]+$/;

/** The name a GraphQL error carries, from its extensions when it has one. */
function codeOf(entry: { message?: string; extensions?: Record<string, unknown> }): string {
  const fromExtensions = entry.extensions?.code;
  if (typeof fromExtensions === 'string' && CODE_SHAPE.test(fromExtensions)) {
    // The GraphQL layer's own spelling for an unauthenticated caller; the
    // platform's auth codes say NOT_AUTHENTICATED.
    return fromExtensions === 'UNAUTHENTICATED' ? 'NOT_AUTHENTICATED' : fromExtensions;
  }
  if (typeof entry.message === 'string' && CODE_SHAPE.test(entry.message)) {
    return entry.message;
  }
  throw new AuthRefusedUnnamed(entry.message ?? 'unknown refusal');
}

/** The HTTP status the tenant recorded for the refusal, when it recorded one. */
function statusOf(entry: { extensions?: Record<string, unknown> }, code: string): number {
  const fromExtensions = entry.extensions?.http;
  if (typeof fromExtensions === 'number' && fromExtensions >= 400 && fromExtensions < 500) {
    return fromExtensions;
  }
  return statusForCode(code);
}

/** The marker the custom fetch throws for anything that is not a 2xx. */
class TransportFailure extends Error {
  constructor(detail: string) {
    super(detail);
    this.name = 'TransportFailure';
  }
}

/**
 * The SDK's own fetch: timeout-armed, and non-2xx converted to a throw so the
 * adapter cannot fold an infrastructure failure into `errors[]` as though the
 * tenant had refused something.
 */
function transportFetch(input: URL | RequestInfo, init?: RequestInit): Promise<Response> {
  // The endpoint is a fixed string this module reads from the environment;
  // masking exists so an error never echoes a caller-controlled URL.
  const url = typeof input === 'string' ? input.split('?')[0] ?? input : input;
  return fetch(input, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) }).then(
    (response) => {
      if (!response.ok) {
        throw new TransportFailure(`HTTP ${response.status} from ${url}`);
      }
      return response;
    },
    (err: unknown) => {
      const detail = err instanceof Error ? err.message : String(err);
      throw new TransportFailure(detail);
    }
  );
}

/** The client for one request: this request's headers, this caller's session. */
export function authClient(req: Request): ReturnType<typeof createClient> {
  if (!endpoint) {
    throw new AuthGraphqlUnreachable('GRAPHQL_AUTH_URL is not set — was local:bringup run?');
  }

  const session = sessionCookieOf(req);
  const userAgent = req.headers.get('user-agent');
  const origin = req.headers.get('origin');

  return createClient({
    endpoint,
    fetch: transportFetch,
    headers: {
      ...(session ? { authorization: `Bearer ${session}` } : {}),
      ...(userAgent !== null ? { 'user-agent': userAgent } : {}),
      ...(origin !== null ? { origin } : {})
    }
  });
}

/** The gateway origin as the browser sees it — response bodies are browser-facing. */
export const GATEWAY_ORIGIN = (
  process.env.NEXT_PUBLIC_SSO_GATEWAY_URL ?? process.env.SSO_GATEWAY_URL ?? 'http://localhost'
).replace(/\/$/, '');

/**
 * The BFF's one answer for a client-surface failure: a refusal the tenant
 * named keeps its code and status; an unnamed refusal answers AUTH_REFUSED
 * (already logged where it was thrown); an unreachable tenant answers 502.
 * Never rethrows — a route that returns this has answered its caller.
 */
export function authErrorResponse(err: unknown): NextResponseJson {
  if (err instanceof AuthRefusal) {
    return NextResponse.json({ error: err.code }, { status: err.status });
  }
  if (err instanceof AuthRefusedUnnamed) {
    return NextResponse.json({ error: err.code }, { status: err.status });
  }
  if (err instanceof AuthGraphqlUnreachable) {
    return NextResponse.json({ error: err.code }, { status: err.status });
  }
  console.warn('[auth-graphql] unexpected client-surface failure', {
    name: err instanceof Error ? err.name : typeof err
  });
  return NextResponse.json({ error: 'AUTH_REFUSED' }, { status: 400 });
}

/** The shared answer's type — NextResponse.json's return. */
type NextResponseJson = ReturnType<typeof NextResponse.json>;

/** The `constructive_session` cookie a request carries, if any. */
export function sessionCookieOf(req: Request): string | null {
  return cookieOf(req, SESSION_COOKIE);
}

/**
 * The `constructive_device_token` cookie this browser was given by an earlier
 * sign-in (either lane's — both write the same host-only cookie), if any.
 * Feeding it back as `deviceToken` is how the tenant recognises the browser.
 */
export function deviceTokenOf(req: Request): string | null {
  return cookieOf(req, 'constructive_device_token');
}

function cookieOf(req: Request, name: string): string | null {
  const header = req.headers.get('cookie');
  if (!header) return null;
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name && rest.length > 0) {
      const value = rest.join('=');
      return value.length > 0 ? value : null;
    }
  }
  return null;
}

/**
 * Execute one SDK query builder with this file's error classification:
 * resolves with the builder's data, throws {@link AuthRefusal} for a tenant
 * refusal (whose message IS the code) or {@link AuthGraphqlUnreachable} for
 * transport. Callers map those to responses; nothing here inspects bodies.
 */
export async function runAuth<T extends Record<string, unknown>>(
  builder: QueryBuilder<T>
): Promise<T> {
  let result: QueryResult<T>;
  try {
    result = await builder.execute();
  } catch (err) {
    // fetch(…) throws for refused/timeout/5xx via transportFetch; anything
    // the adapter itself throws on is equally not a tenant refusal.
    if (err instanceof TransportFailure) {
      throw new AuthGraphqlUnreachable(err.message);
    }
    const detail = err instanceof Error ? err.message : String(err);
    throw new AuthGraphqlUnreachable(detail);
  }
  if (result.ok) {
    return result.data;
  }
  // The code lives in extensions when the layer wrote one (code, http), and
  // in the message when the platform's errors.raise_error raised it — the
  // message IS the code there. Prose messages are the unnamed class above.
  const first = result.errors?.[0];
  if (!first) {
    throw new AuthGraphqlUnreachable('unknown GraphQL failure');
  }
  const code = codeOf(first);
  throw new AuthRefusal(code, statusOf(first, code));
}
