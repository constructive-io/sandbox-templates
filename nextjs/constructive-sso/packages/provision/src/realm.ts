/**
 * realm — who provisioning acts as, and how that identity reaches Postgres.
 *
 * A database is its own identity realm (constructive-planning#2134): the
 * platform issues the owner a platform session, and the tenant, once the
 * reconciler has bootstrapped the owner into it, issues the owner a tenant
 * session. Every write these steps make runs as one of those two sessions,
 * never as nobody and never as an identity typed into the claims by hand:
 *
 *   - GraphQL, where the realm exposes the operation: the bearer token goes to
 *     that realm's endpoint and the server derives the claims.
 *   - SQL, where it does not: a privileged connection (provisioning is one of
 *     the internal lanes `administrator` serves) runs the write in one
 *     transaction whose claims are what the realm's own `authenticate()`
 *     answers for the token, the function the gateway calls for a bearer
 *     token. That is the platform's own fixture shape (`withActor` with a
 *     `credential`, compute/testkit/test-utils/src/actor.ts), so the guards on
 *     security-critical tables see the same owner and session a request would.
 *
 * The owner's credentials come from the root .env: OWNER_EMAIL, OWNER_PASSWORD.
 */

import type { Client } from 'pg';

import { env, required } from './env.js';

export interface Session {
  /** The realm's auth GraphQL endpoint the session was issued by. */
  endpoint: string;
  /** The realm: the database whose auth schema issued the token. */
  databaseId: string;
  userId: string;
  token: string;
}

interface GqlError {
  message: string;
  extensions?: { code?: string };
}

export class GraphQLRefusal extends Error {
  constructor(
    readonly endpoint: string,
    readonly errors: GqlError[]
  ) {
    super(`${endpoint}: ${errors.map((e) => `${e.extensions?.code ?? 'ERROR'}: ${e.message}`).join('; ')}`);
  }

  get codes(): string[] {
    return this.errors.map((e) => e.extensions?.code ?? e.message);
  }
}

export const gql = async <T>(
  endpoint: string,
  query: string,
  variables: Record<string, unknown> = {},
  token?: string
): Promise<T> => {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ query, variables })
  });
  const text = await res.text();
  let body: { data?: T; errors?: GqlError[] };
  try {
    body = JSON.parse(text) as typeof body;
  } catch {
    throw new Error(`${endpoint} answered HTTP ${res.status} with a non-JSON body: ${text.slice(0, 200)}`);
  }
  if (body.errors?.length) throw new GraphQLRefusal(endpoint, body.errors);
  if (!body.data) throw new Error(`${endpoint} answered HTTP ${res.status} with no data`);
  return body.data;
};

const SIGN_IN = `mutation SignIn($input: SignInInput!) {
  signIn(input: $input) { result { userId accessToken mfaRequired } }
}`;
const SIGN_UP = `mutation SignUp($input: SignUpInput!) {
  signUp(input: $input) { clientMutationId }
}`;

interface SignInResult {
  signIn: { result: { userId: string | null; accessToken: string | null; mfaRequired: boolean | null } | null } | null;
}

const owner = () => ({ email: env.OWNER_EMAIL ?? 'owner@myapp.local', password: required('OWNER_PASSWORD') });

/**
 * Password sign-in on a realm's auth endpoint. An unknown address and a wrong
 * password both answer a null result, not an error (no account enumeration),
 * so "no session" is a value here and the caller decides what it means.
 */
const trySignIn = async (endpoint: string, databaseId: string): Promise<Session | null> => {
  const { email, password } = owner();
  let data: SignInResult;
  try {
    data = await gql<SignInResult>(endpoint, SIGN_IN, { input: { email, password, credentialKind: 'access_token' } });
  } catch (err) {
    if (err instanceof GraphQLRefusal && err.codes.includes('ACCOUNT_LOCKED_EXCEED_ATTEMPTS')) {
      throw new Error(
        `${email} is locked out of ${endpoint} after repeated failed sign-ins (the realm's sign-in throttle). ` +
          'Wait for the lock to expire, then re-run; check OWNER_PASSWORD first.',
        { cause: err }
      );
    }
    throw err;
  }
  const result = data.signIn?.result;
  if (result?.mfaRequired) {
    throw new Error(
      `${email} has a second factor on ${endpoint}: sign-in answers an MFA challenge, not a session. ` +
        'Provisioning signs in with the password alone — use an owner account without 2FA.'
    );
  }
  if (!result?.userId || !result.accessToken) return null;
  return { endpoint, databaseId, userId: result.userId, token: result.accessToken };
};

export const signIn = async (endpoint: string, databaseId: string): Promise<Session> => {
  const session = await trySignIn(endpoint, databaseId);
  if (!session) {
    throw new Error(`${endpoint} issued no session for ${owner().email}: no such account, or OWNER_PASSWORD is wrong`);
  }
  return session;
};

/** The platform's auth lane (the kind cluster's Traefik ingress). */
export const PLATFORM_AUTH_ENDPOINT = env.OWNER_AUTH_ENDPOINT ?? 'http://auth.localhost/graphql';
/** The platform's api lane: requestDatabase lives here. */
export const PLATFORM_API_ENDPOINT = env.PLATFORM_API_ENDPOINT ?? 'http://api.localhost/graphql';

export const platformDatabaseId = async (client: Client): Promise<string> =>
  ((await client.query('SELECT app_scope.platform_database_id() AS id')).rows[0] as { id: string }).id;

const VERIFY_EMAIL = `mutation VerifyEmail($input: VerifyEmailInput!) {
  verifyEmail(input: $input) { result }
}`;
const FORGOT_PASSWORD = `mutation ForgotPassword($input: ForgotPasswordInput!) {
  forgotPassword(input: $input) { clientMutationId }
}`;
const RESET_PASSWORD = `mutation ResetPassword($input: ResetPasswordInput!) {
  resetPassword(input: $input) { result }
}`;

/** Mailpit's API: the local mailbox the platform's mail lands in. */
const MAILPIT_API = env.MAILPIT_API_URL ?? 'http://localhost:18025/api/v1';

const inbox = async (to: string): Promise<Array<{ ID: string; Created: string }>> =>
  (
    (await (await fetch(`${MAILPIT_API}/search?query=${encodeURIComponent(`to:${to}`)}&limit=10`)).json()) as {
      messages: Array<{ ID: string; Created: string }>;
    }
  ).messages;

/** Mailpit's own timestamp of the newest mail to `to`: "after" is judged on its clock, not this host's. */
const mailboxMark = async (to: string): Promise<number> =>
  Math.max(0, ...(await inbox(to)).map((m) => Date.parse(m.Created)));

/**
 * The first link whose path is `path` in a mail to `to` newer than `mark`,
 * waiting up to `seconds` for the email job. Null if none arrives — a mail
 * without that link (a sign-up attempt notice) is not the one waited for.
 */
const mailedLink = async (to: string, mark: number, path: string, seconds: number): Promise<URL | null> => {
  for (let waited = 0; waited <= seconds; waited += 2) {
    for (const { ID, Created } of await inbox(to)) {
      if (Date.parse(Created) <= mark) continue;
      const { Text } = (await (await fetch(`${MAILPIT_API}/message/${ID}`)).json()) as { Text: string };
      const link = (Text.match(/https?:\/\/[^\s"<>)]+/g) ?? []).map((href) => new URL(href)).find((u) => u.pathname === path);
      if (link) return link;
    }
    await new Promise((done) => setTimeout(done, 2000));
  }
  return null;
};

const param = (url: URL, name: string): string => {
  const value = url.searchParams.get(name);
  if (!value) throw new Error(`the mailed ${url.pathname} link carries no ${name}`);
  return value;
};

/**
 * The owner's platform session. With `create`, a run that finds none sets the
 * account up the way a person does, through the mailbox:
 *
 *   1. sign up. The password stays pending until the address is proven
 *      (planning#2291): a sign-in before the mailed link answers no session.
 *   2. open the mailed verification link (verifyEmail), which makes the pending
 *      password the account's password.
 *   3. if there is still no session, recover through forgot/reset password.
 *      That is the case #2291 designed for a contested address: a second
 *      sign-up on an address holding a pending password drops it, so whoever
 *      proves the address holds an account with no password — which is where
 *      a first run interrupted between steps 1 and 2 leaves the owner.
 */
export const platformSession = async (client: Client, opts: { create?: boolean } = {}): Promise<Session> => {
  const databaseId = await platformDatabaseId(client);
  const existing = await trySignIn(PLATFORM_AUTH_ENDPOINT, databaseId);
  if (existing || !opts.create) return existing ?? signIn(PLATFORM_AUTH_ENDPOINT, databaseId);

  const { email, password } = owner();
  console.log('  no platform session for the owner — signing up');
  let mark = await mailboxMark(email);
  await gql(PLATFORM_AUTH_ENDPOINT, SIGN_UP, { input: { email, password } });
  // A sign-up on an address someone already proved mails a notice, not a
  // link, so its absence after a short wait is an answer, not a failure.
  const verify = await mailedLink(email, mark, '/verify-email', 20);
  if (verify) {
    await gql(PLATFORM_AUTH_ENDPOINT, VERIFY_EMAIL, {
      input: { emailId: param(verify, 'email_id'), token: param(verify, 'verification_token') }
    });
    console.log(`  ${email}: opened the mailed verification link`);
    const session = await trySignIn(PLATFORM_AUTH_ENDPOINT, databaseId);
    if (session) return session;
  }

  console.log(`  ${email} holds no password (a contested sign-up, planning#2291) — resetting it from the mailbox`);
  mark = await mailboxMark(email);
  await gql(PLATFORM_AUTH_ENDPOINT, FORGOT_PASSWORD, { input: { email } });
  const reset = await mailedLink(email, mark, '/reset-password', 60);
  if (!reset) throw new Error(`forgotPassword mailed ${email} no /reset-password link within 60s (Mailpit ${MAILPIT_API})`);
  await gql(PLATFORM_AUTH_ENDPOINT, RESET_PASSWORD, {
    input: { roleId: param(reset, 'role_id'), resetToken: param(reset, 'reset_token'), newPassword: password }
  });
  return signIn(PLATFORM_AUTH_ENDPOINT, databaseId);
};

/** The owner's session in the tenant's own realm (its auth-<slug> host). */
export const tenantSession = (): Promise<Session> =>
  signIn(required('GRAPHQL_AUTH_URL'), required('DATABASE_ID'));

const setClaims = (client: Client, claims: Record<string, string>) =>
  client.query('SELECT set_config(c.key, c.value, true) FROM jsonb_each_text($1::jsonb) AS c', [
    JSON.stringify(claims)
  ]);

/** The realm's own authenticate(), resolved through its routing row. */
const authenticateFunction = async (client: Client, databaseId: string): Promise<string> => {
  const { rows } = await client.query(
    `SELECT format('%I.%I', s.schema_name, f.name) AS fn
       FROM routing_public.rls_settings rs
       JOIN metaschema_public.schema s ON s.id = rs.authenticate_schema_id
       JOIN metaschema_public.function f ON f.id = rs.authenticate_function_id
      WHERE rs.database_id = $1`,
    [databaseId]
  );
  if (rows.length !== 1) throw new Error(`database ${databaseId} has no rls_settings authenticate() row`);
  return (rows[0] as { fn: string }).fn;
};

/**
 * Run `fn` in one transaction as `session`, attributed to `databaseId`.
 *
 * The claims are the realm's answer for the token. When `databaseId` is the
 * session's own realm they carry its session and credential ids, which the
 * step-up guards load. When it is another database (the owner's platform
 * session writing the tenant's rows in the platform's shared planes, keyed by
 * the tenant), only the user and principal travel: the session and credential
 * rows exist in the platform realm alone.
 */
export const asSession = async <T>(
  client: Client,
  session: Session,
  databaseId: string,
  fn: () => Promise<T>
): Promise<T> => {
  await client.query('BEGIN');
  try {
    await setClaims(client, { 'jwt.claims.database_id': session.databaseId });
    const authenticate = await authenticateFunction(client, session.databaseId);
    const { rows } = await client.query(
      `SELECT id, user_id, session_id, principal_id FROM ${authenticate}($1)`,
      [session.token]
    );
    const who = rows[0] as
      | { id: string; user_id: string | null; session_id: string | null; principal_id: string | null }
      | undefined;
    if (!who?.user_id) throw new Error(`${session.endpoint}'s authenticate() does not recognise the session token`);
    if (who.user_id !== session.userId) {
      throw new Error(`authenticate() names user ${who.user_id}, but sign-in reported ${session.userId}`);
    }
    const sameRealm = databaseId === session.databaseId;
    const claims: Record<string, string> = {
      'jwt.claims.database_id': databaseId,
      'jwt.claims.user_id': who.user_id
    };
    if (who.principal_id) claims['jwt.claims.principal_id'] = who.principal_id;
    if (sameRealm && who.session_id) claims['jwt.claims.session_id'] = who.session_id;
    if (sameRealm) claims['jwt.claims.token_id'] = who.id;
    await setClaims(client, claims);
    const result = await fn();
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  }
};
