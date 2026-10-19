/**
 * ensure-site — the tenant's site on SSO_ROUTE_HOST, consuming the platform's
 * shared mantra/sso images with no per-tenant registration (frame-chain
 * routing, constructive-db PR #3475).
 *
 * Every write runs as the owner's platform session, attributed to the tenant
 * (realm.ts): the site, its routes and its domain are the tenant's rows in the
 * platform's shared database-scope planes, and the verbs gate on the owner's
 * manage_sites capability in the org that owns the tenant.
 *
 *   1. sites_provision_static_site (lookup first — the verb is not idempotent):
 *      bucket, site, web config, the root route, and the domains row for the
 *      host, claimed or reused (DOMAIN_ALREADY_CLAIMED if another database
 *      holds it).
 *   2. LOCAL WORKAROUND — the loopback host's verification (see below).
 *   3. canonical_url in site_metadata: oauth_start composes the provider
 *      callback from it, and hosted sessions bind their step-up origin to it.
 *   4. sites_install_mantra: the `mantra` page set and the `sso` preset (the
 *      provider legs /auth/start and /auth/callback).
 *   5. /auth/link -> sso:link through install_route_bindings.
 *   6. The site root '/' as a redirect into the app.
 *   7. A resolve_route walk: every bound path must resolve.
 */

import { Client } from 'pg';

import { env, pgConfig, required } from './env.js';
import { asSession, platformSession } from './realm.js';

const DATABASE_ID = required('DATABASE_ID');
const SITE_NAME = env.DATABASE_NAME ?? 'myapp';
const DOMAIN = env.SSO_ROUTE_HOST ?? 'localhost';
const APP_ORIGIN = env.APP_ORIGIN ?? 'http://localhost:3000';
// Scheme-less: the static gateway composes `<request scheme>://<to_host><path>`.
const REDIRECT_TO_HOST = new URL(APP_ORIGIN).host;
const MANTRA_PRESET_SLUG = env.MANTRA_PRESET_SLUG ?? 'mantra';

async function main(): Promise<void> {
  const client = new Client(pgConfig);
  await client.connect();
  const owner = await platformSession(client);
  const asOwner = <T>(fn: () => Promise<T>) => asSession(client, owner, DATABASE_ID, fn);

  // ---- 1. The site. ----
  const existingSite = await client.query(
    `SELECT id FROM routing_public.sites WHERE database_id = $1 AND name = $2`,
    [DATABASE_ID, SITE_NAME]
  );
  let siteId: string;
  if (existingSite.rowCount === 0) {
    const created = await asOwner(() =>
      client.query(
        `SELECT target_site_id AS site_id
           FROM routing_public.sites_provision_static_site(name := $1, hostname := $2)`,
        [SITE_NAME, DOMAIN]
      )
    );
    siteId = (created.rows[0] as { site_id: string }).site_id;
    console.log(`site: provisioned '${SITE_NAME}' (${siteId}) on '${DOMAIN}'`);
  } else {
    siteId = (existingSite.rows[0] as { id: string }).id;
    console.log(`site: reusing '${SITE_NAME}' (${siteId})`);
  }

  // ---- 2. LOCAL WORKAROUND: verify the loopback host. ----
  // resolve_route serves only verified hostnames. A custom hostname is
  // verified by the managed-domain ownership loop (a DNS TXT or http_01
  // challenge the reconciler observes), and no challenge can prove a bare
  // `localhost`: inside the cluster that name is the reconciler's own pod. The
  // platform's sanctioned local host, a `<label>.sites.localhost` subdomain of
  // the seeded apex, arrives verified — but Google refuses redirect URIs on
  // `.localhost` subdomains, and the app and the gateway must share one cookie
  // host. So the loopback row is marked verified here, by its owner, on the
  // source table (the hostname_bindings index is recompiled from it by
  // trigger). Refused for any other hostname.
  if (DOMAIN !== 'localhost') {
    throw new Error(`SSO_ROUTE_HOST '${DOMAIN}' is not loopback: verify it through the managed-domain flow`);
  }
  const verified = await asOwner(() =>
    client.query(
      `UPDATE routing_public.domains SET verification_status = 'verified', verified_at = now()
        WHERE hostname = $1 AND database_id = $2 AND verification_status IS DISTINCT FROM 'verified'`,
      [DOMAIN, DATABASE_ID]
    )
  );
  const binding = await client.query(
    `SELECT verification_status FROM routing_public.hostname_bindings WHERE hostname = $1`,
    [DOMAIN]
  );
  if ((binding.rows[0] as { verification_status: string } | undefined)?.verification_status !== 'verified') {
    throw new Error(`hostname_bindings for '${DOMAIN}' is not 'verified' — resolve_route would 404 every path`);
  }
  console.log(`hostname: '${DOMAIN}' verified${verified.rowCount ? ' (loopback workaround)' : ' (already)'}`);
  const domainRow = await client.query(
    `SELECT id FROM routing_public.domains WHERE hostname = $1 AND database_id = $2`,
    [DOMAIN, DATABASE_ID]
  );
  const domainId = (domainRow.rows[0] as { id: string }).id;

  // ---- 3. canonical_url. ----
  await asOwner(() =>
    client.query(
      `INSERT INTO routing_public.site_metadata (database_id, site_id, canonical_url)
       VALUES ($1, $2, $3)
       ON CONFLICT (site_id) DO UPDATE SET canonical_url = EXCLUDED.canonical_url`,
      [DATABASE_ID, siteId, APP_ORIGIN]
    )
  );
  console.log(`site_metadata: canonical_url = ${APP_ORIGIN}`);

  // ---- 4. The mantra page set and the sso provider legs. ----
  for (const preset of [MANTRA_PRESET_SLUG, 'sso']) {
    await asOwner(() =>
      client.query(`SELECT routing_public.sites_install_mantra(site_id := $1, route_preset := $2)`, [siteId, preset])
    );
    console.log(`preset '${preset}': installed`);
  }

  // ---- 5. /auth/link: the one SSO sync lane. ----
  // A provider sign-in whose address an existing account owns parks the
  // identity behind a ticket the signed-in owner spends here. Authenticated
  // on purpose: no `anonymous` flag.
  const bindings = [{ path: '/auth/link', target: 'function', task_identifier: 'sso:link' }];
  const installed = await asOwner(() =>
    client.query(
      `SELECT function_resolution.install_route_bindings(
         database_id := $1, sites_schema := 'routing_public', sites_table := 'sites',
         site_id := $2, bindings := $3::jsonb) AS report`,
      [DATABASE_ID, siteId, JSON.stringify(bindings)]
    )
  );
  const report = (installed.rows[0] as { report: { domain_id: string; installed: string[]; skipped: string[] } })
    .report;
  if (report.domain_id !== domainId) {
    throw new Error(`install_route_bindings bound to domain ${report.domain_id}, not '${DOMAIN}' (${domainId})`);
  }
  console.log(`sync lanes: installed [${report.installed.join(', ')}] skipped [${report.skipped.join(', ')}]`);

  // ---- 6. The site root '/' redirects into the app. ----
  // The mantra pages land on '/' after sign-in (same-origin `next` only). A
  // redirect row is tenant data, so a redirect route at '/' turns that landing
  // into a hop to the app. Two routes at '/': the site keeps its own, which the
  // install verbs require (ROUTE_BINDINGS_SITE_NOT_ROUTED otherwise), and the
  // redirect wins on priority (resolve_route orders priority DESC).
  await asOwner(async () => {
    const redirect = await client.query(
      `INSERT INTO routing_public.redirects
         (database_id, name, to_host, to_path, status_code, preserve_path, preserve_query)
       VALUES ($1, 'app-origin', $2, '/', 302, false, true)
       ON CONFLICT (database_id, name) DO UPDATE SET
         to_host = EXCLUDED.to_host, to_path = EXCLUDED.to_path, status_code = EXCLUDED.status_code,
         preserve_path = EXCLUDED.preserve_path, preserve_query = EXCLUDED.preserve_query, updated_at = now()
       RETURNING id`,
      [DATABASE_ID, REDIRECT_TO_HOST]
    );
    const redirectId = (redirect.rows[0] as { id: string }).id;
    await client.query(
      `INSERT INTO routing_public.routes (database_id, domain_id, path, target_redirect_id, priority, is_active)
       SELECT $1::uuid, $2::uuid, '/', $3::uuid, 10, true
        WHERE NOT EXISTS (SELECT 1 FROM routing_public.routes
                           WHERE database_id = $1 AND domain_id = $2 AND path = '/' AND target_redirect_id = $3)`,
      [DATABASE_ID, domainId, redirectId]
    );
  });

  // ---- 7. Every bound path resolves. ----
  const mantra = (
    await client.query(`SELECT metaschema_generators.content_preset_definition('route_bindings', $1) AS b`, [
      MANTRA_PRESET_SLUG
    ])
  ).rows[0] as { b: Array<{ path: string; task_identifier: string }> };
  const paths = [
    ...mantra.b.map((b) => ({ path: b.path, task: b.task_identifier, site: true })),
    ...bindings.map((b) => ({ path: b.path, task: b.task_identifier, site: false }))
  ];
  for (const { path, task, site } of paths) {
    const { rows } = await client.query(
      `SELECT target_module, resolved_config FROM routing_public.resolve_route($1, $2, 'GET')`,
      [DOMAIN, path]
    );
    const row = rows[0] as { target_module: string; resolved_config: Record<string, unknown> } | undefined;
    if (row?.target_module !== 'function' || row.resolved_config?.task_identifier !== task) {
      throw new Error(`${DOMAIN}${path} does not resolve to ${task} (got ${JSON.stringify(row ?? null)})`);
    }
    if (site && row.resolved_config.site_id !== siteId) {
      throw new Error(`${DOMAIN}${path} serves site '${String(row.resolved_config.site_id)}', not '${siteId}'`);
    }
  }
  const root = (
    await client.query(
      `SELECT serving_lane, resolved_config->>'to_host' AS to_host FROM routing_public.resolve_route($1, '/', 'GET')`,
      [DOMAIN]
    )
  ).rows[0] as { serving_lane: string; to_host: string } | undefined;
  if (root?.serving_lane !== 'redirect' || root.to_host !== REDIRECT_TO_HOST) {
    throw new Error(`'/' does not resolve to the app redirect (got ${JSON.stringify(root ?? null)})`);
  }
  console.log(`routes: ${paths.length} paths resolve on ${DOMAIN}; '/' -> 302 ${REDIRECT_TO_HOST}/`);

  await client.end();
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? (err.stack ?? err.message) : String(err));
  process.exit(1);
});
