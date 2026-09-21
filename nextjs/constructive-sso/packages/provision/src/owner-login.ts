/**
 * owner-login — establish the real platform user provisioning acts as.
 *
 * Signs UP (first run) / signs IN through the platform's own auth GraphQL lane
 * — the same lane the dashboard uses — and writes the user's id into the root
 * .env as OWNER_USER_ID. Subsequent create-db / ensure-site runs then act as
 * that user: request_database assigns it the tenant's ownership, and the org
 * gates see a legitimate owner instead of a seeded machine principal.
 *
 * Credentials come from the environment (the root .env, gitignored):
 *   OWNER_EMAIL     (default owner@myapp.local)
 *   OWNER_PASSWORD  (required — never defaulted, never committed)
 *   OWNER_AUTH_ENDPOINT (default http://auth.localhost/graphql on the kind
 *                        cluster's Traefik ingress; the old :3000 default
 *                        belongs to the retired cnc docker-compose flow)
 */
import dotenv from 'dotenv';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT_ENV_PATH = path.resolve(MODULE_DIR, '../../../.env');
dotenv.config({ path: ROOT_ENV_PATH });

const env = process.env;
const AUTH_ENDPOINT =
  env.OWNER_AUTH_ENDPOINT ?? env.AUTH_ENDPOINT ?? 'http://auth.localhost/graphql';
const EMAIL = env.OWNER_EMAIL ?? 'owner@myapp.local';
const PASSWORD = env.OWNER_PASSWORD ?? '';
const CREDENTIAL_KIND = 'access_token';

const SIGN_IN = `mutation SignIn($input: SignInInput!) {
  signIn(input: $input) { result { userId accessToken accessTokenExpiresAt } }
}`;
const SIGN_UP = `mutation SignUp($input: SignUpInput!) {
  signUp(input: $input) { result { userId accessToken } }
}`;

interface SessionRecord {
  userId: string | null;
  accessToken: string | null;
  accessTokenExpiresAt?: string | null;
}

type GqlData = Record<string, { result: SessionRecord | null } | null>;

const gql = async (query: string, variables: unknown): Promise<GqlData> => {
  const res = await fetch(AUTH_ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables })
  });
  const body = (await res.json()) as {
    data?: GqlData;
    errors?: Array<{ message: string }>;
  };
  if (body.errors?.length) {
    throw new Error(body.errors.map((e) => e.message).join('; '));
  }
  return body.data ?? {};
};

/** Upsert one KEY=VALUE line into the root .env (same pattern as create-db). */
const upsertEnv = (key: string, value: string): void => {
  if (!existsSync(ROOT_ENV_PATH)) {
    writeFileSync(ROOT_ENV_PATH, `${key}=${value}\n`);
    return;
  }
  const lines = readFileSync(ROOT_ENV_PATH, 'utf8').split('\n');
  const index = lines.findIndex((line) => line.startsWith(`${key}=`));
  if (index >= 0) lines[index] = `${key}=${value}`;
  else lines.push(`${key}=${value}`);
  writeFileSync(ROOT_ENV_PATH, lines.join('\n') + '\n');
};

async function main(): Promise<void> {
  if (!PASSWORD) {
    console.error('\n  !! OWNER_PASSWORD not set — add it to the root .env first.\n');
    process.exit(1);
  }

  console.log(`  endpoint: ${AUTH_ENDPOINT}`);
  console.log(`  owner:    ${EMAIL}`);

  let record: SessionRecord | null = null;
  try {
    record =
      ((await gql(SIGN_IN, {
        input: { email: EMAIL, password: PASSWORD, credentialKind: CREDENTIAL_KIND }
      })).signIn ?? null)?.result ?? null;
  } catch (signInError) {
    // An unknown user is not always an error — the lane can also answer with a
    // null result — so both shapes fall through to sign-up below.
    console.log(
      `  sign-in refused (${signInError instanceof Error ? signInError.message : signInError})`
    );
  }
  if (record?.accessToken) {
    console.log('  signed in');
  } else {
    // First run: no such user yet — create it, then use the session signUp
    // mints (falling back to signIn if the record carries no token, and
    // tolerating an EMAIL_TAKEN-style refusal from a previous partial run).
    console.log('  no session — creating the owner');
    try {
      record =
        ((await gql(SIGN_UP, { input: { email: EMAIL, password: PASSWORD } })).signUp ?? null)
          ?.result ?? null;
    } catch (signUpError) {
      console.log(
        `  sign-up refused (${signUpError instanceof Error ? signUpError.message : signUpError}) — trying sign-in`
      );
    }
    if (!record?.accessToken) {
      record =
        ((await gql(SIGN_IN, {
          input: { email: EMAIL, password: PASSWORD, credentialKind: CREDENTIAL_KIND }
        })).signIn ?? null)?.result ?? null;
    }
    if (record?.accessToken) console.log('  owner created');
  }

  const userId = record?.userId;
  const token = record?.accessToken;
  if (!userId || !token) {
    throw new Error(`auth lane returned no session (${JSON.stringify(record)})`);
  }

  // Best-effort cross-check: when the token is a JWT, its subject must name
  // the same user the lane reported — a mismatch means our claims plumbing is
  // wrong, and it is better to fail here than to provision under an unintended
  // identity. An opaque token (no JWT shape) skips the check — it verifies
  // nothing we can compare.
  const segments = token.split('.');
  if (segments.length === 3 && segments[1]) {
    try {
      const payload = JSON.parse(Buffer.from(segments[1], 'base64url').toString('utf8')) as Record<
        string,
        unknown
      >;
      const subject = payload.sub ?? payload.user_id ?? payload.userId;
      if (subject && String(subject) !== userId) {
        throw new Error(`token subject ${String(subject)} != reported userId ${userId}`);
      }
    } catch (verifyError) {
      console.warn(
        `  (token subject not verified: ${verifyError instanceof Error ? verifyError.message : verifyError})`
      );
    }
  }

  upsertEnv('OWNER_USER_ID', userId);
  console.log(`\n  owner ready: ${EMAIL} (user ${userId})`);
  console.log('  OWNER_USER_ID written to .env');
  console.log('\n  next: pnpm run create-db — the tenant will be owned by this user.');
}

main().catch((err: unknown) => {
  console.error(`\n  owner-login failed: ${err instanceof Error ? (err.stack ?? err.message) : err}\n`);
  process.exit(1);
});
