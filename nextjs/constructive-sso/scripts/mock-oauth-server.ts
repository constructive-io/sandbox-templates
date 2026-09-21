#!/usr/bin/env npx tsx
/**
 * TEST-ONLY OAUTH SERVER. Never expose this process or any test control routes
 * in production. It exists only for local and CI E2E tests.
 *
 * This intentionally uses oauth2-mock-server's real authorization-code and
 * PKCE implementation. It is not a Constructive dry-run and it must never be
 * used outside local/CI test environments.
 *
 * Ported from constructive-hub/tests/oauth/utils/mock-oauth-server.ts.
 *
 * Usage: pnpm mock-oauth
 */

import { Events, OAuth2Server } from 'oauth2-mock-server';

async function main(): Promise<void> {
  const port = Number(process.env.OAUTH_MOCK_PORT || 4010);
  const host = process.env.OAUTH_MOCK_HOST || '0.0.0.0';
  const subject = process.env.OAUTH_TEST_SUB || 'sso-test-user';
  const email = process.env.OAUTH_TEST_EMAIL || `${subject}@example.test`;
  // The issuer URL travels INSIDE the id_token (`iss`) and must match the
  // provider row the platform validates against. When the exchange runs in a
  // cluster pod, `localhost` means the POD — override with a pod-reachable
  // address (Docker Desktop: 192.168.65.254) and point the provider row's
  // endpoints at the same origin.
  const issuer = process.env.OAUTH_MOCK_ISSUER || `http://localhost:${port}`;

  const server = new OAuth2Server();
  // v9 exposes the issuer URL as a settable property (id_token `iss`).
  server.issuer.url = issuer;
  await server.issuer.keys.generate('RS256');

  server.service.on(Events.BeforeUserinfo, (response) => {
    response.body = {
      sub: subject,
      email,
      email_verified: true,
      name: 'SSO Test User',
      picture: 'https://example.test/oauth-avatar.png',
    };
  });

  // The id_token's sub must MATCH the userinfo sub: the platform's callback
  // rejects a provider whose two responses describe different subjects
  // (SSO_PROVIDER_RESPONSE_INVALID). The mock's default token subject is its
  // built-in demo user, so align it with the userinfo override above.
  server.service.on(Events.BeforeTokenSigning, (token) => {
    token.payload.sub = subject;
  });

  server.service.addRoute('GET', '/health', (_req, res) => {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ ok: true, issuer: server.issuer.url }));
  });

  await server.start(port, host);
  console.log(`oauth2-mock-server listening at ${server.issuer.url} (issuer: ${issuer})`);

  let stopping = false;
  async function stop(signal: string): Promise<void> {
    if (stopping) return;
    stopping = true;
    console.log(`Stopping oauth2-mock-server (${signal})`);
    await server.stop();
  }

  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.on(signal, () => {
      void stop(signal).then(() => process.exit(0));
    });
  }
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
