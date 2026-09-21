/**
 * ensure-site — provision the tenant's site and bind the shared auth/content
 * surfaces onto it, consuming the platform's shared function images with NO
 * per-tenant registration (the frame-chain model, constructive-db PR #3475).
 *
 * This replaces bind-routes.ts. The platform serves mantra/sso/auth-flows from
 * definitions registered ONCE at platform scope; a tenant route may target any
 * definition on its own frame chain (allow_frame_chain on target_function_id),
 * and install_route_bindings resolves the sites plane along the caller's
 * frames, so a tenant served by the shared routing_public plane can install.
 *
 * In order (every write wrapped in tx() for attribution):
 *   1. ensure the site via sites_provision_static_site (lookup first — the
 *      verb is not idempotent);
 *   2. DURABLE hostname verification — write the source routing_public.domains
 *      (never the compiled hostname_bindings index), assert rowCount;
 *   3. canonical_url in site_metadata (oauth_start composes the callback from
 *      it — SSO_SITE_ORIGIN_UNKNOWN without it);
 *   4. sites_install_mantra — the preset paths;
 *   4b. the tenant's invocation plane (see the block comment — upstream gap
 *       remainder, raised with Dan);
 *   5. sync lanes + sso/auth_flows lanes via one install_route_bindings custom
 *      doc, each carrying the typed `anonymous` flag the manifest declares
 *      (the gateway requires the route-level flag AND the definition's
 *      anonymous_callable — both halves, neither alone);
 *   6. verification walk through routing_public.resolve_route;
 *   7. site root '/' repointed to an app-origin redirect ROW — the mantra
 *      pages may only land same-origin (open-redirect guard on `next`), and a
 *      tenant-configured redirect is the sanctioned way to bridge that landing
 *      into the consumer app (ports on localhost share the session cookie).
 *
 * Fail-loud throughout: a verb error or a route that does not resolve is a
 * fault to surface, never to skip.
 */

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as dotenv from 'dotenv';
import { Client } from 'pg';

import { claimsFor, resolveActingUser } from './owner-identity.js';

const MODULE_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT_ENV_PATH = resolve(MODULE_DIR, '../../../.env');
dotenv.config({ path: ROOT_ENV_PATH });

const env = process.env;
const SITE_NAME = env.DATABASE_NAME ?? 'myapp';
const DOMAIN = env.SSO_ROUTE_HOST ?? 'localhost';
const APP_ORIGIN = env.APP_ORIGIN ?? 'http://localhost:3000';
// Scheme-less host of the app origin: the static gateway composes the
// Location as `<request scheme>://<to_host><path>`, so the redirect follows
// whatever scheme the browser arrived on.
const REDIRECT_TO_HOST = new URL(APP_ORIGIN).host;
const MANTRA_PRESET_SLUG = env.MANTRA_PRESET_SLUG ?? 'mantra';

const PGHOST = env.PGHOST ?? 'localhost';
const PGPORT = Number(env.PGPORT ?? 15432);
const PGDATABASE = env.PGDATABASE ?? 'constructive-functions-db1';
const PGUSER = env.PGUSER ?? 'postgres';
const PGPASSWORD = env.PGPASSWORD ?? 'password';

const DATABASE_ID = env.DATABASE_ID ?? '';

/** One route binding for install_route_bindings' custom document. */
interface RouteBinding {
  path: string;
  target: 'function';
  task_identifier: string;
  /**
   * The route's half of the anonymous pair. Declare it only where the task's
   * manifest declares `anonymousAccess` (the definition-level consent) — the
   * gateway requires BOTH and admits neither half alone.
   */
  anonymous?: boolean;
}

/**
 * Run fn inside one transaction with claims set transaction-locally.
 *
 * Every write in this script goes through here, not just the SECURITY DEFINER
 * verbs: routing_public.domains and routes carry principalstamps triggers that
 * read jwt_public.current_principal_id(), and an unattributed write stamps NULL
 * (attribution only warns today, so nothing would catch the omission). Claims
 * are set with is_local = true, so they must live in the same transaction as
 * the statement that reads them.
 */
const tx = async <T>(client: Client, claims: string, fn: () => Promise<T>): Promise<T> => {
  await client.query('BEGIN');
  await client.query(`SELECT set_config(c.key, c.value, true) FROM jsonb_each_text($1::jsonb) AS c`, [claims]);
  try {
    const result = await fn();
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  }
};

async function main(): Promise<void> {
  if (!DATABASE_ID) throw new Error('missing DATABASE_ID in the environment (run create-db first)');
  const tenantDatabaseId = DATABASE_ID;

  const client = new Client({ host: PGHOST, port: PGPORT, database: PGDATABASE, user: PGUSER, password: PGPASSWORD });
  try {
    await client.connect();
  } catch (err: unknown) {
    const detail = err instanceof Error ? (err.stack ?? err.message) : String(err);
    throw new Error(
      `cannot connect to the platform database (${PGHOST}:${PGPORT}/${PGDATABASE}) — ` +
        `is 'fun up --alt-ports' running and finished?\n${detail}`
    );
  }

  // Who this run acts as: the real owner when owner-login established one
  // (issue-2 fix — the site verbs gate on the OWNING org's SPRT, and a real
  // owner satisfies them the honest way), else the legacy machine principal.
  const acting = await resolveActingUser(client, process.env.OWNER_USER_ID);
  const userId = acting.userId;
  // Claims per the platform's session contract: principal_id holds the
  // principal's USER id — the same value SPRT is keyed by — never
  // principals.id. The capability gate's COALESCE(principal_id, user_id)
  // therefore resolves to the user id either way. (Dan, 8-31: SPRT verdict.)
  const tenantClaims = claimsFor(tenantDatabaseId, userId);
  // Same identity plus the super-constructive GUC the module generators demand
  // for platform/database-scope plane provisioning.
  const superClaims = JSON.stringify({
    'jwt.claims.database_id': tenantDatabaseId,
    'jwt.claims.user_id': userId,
    'jwt.claims.principal_id': userId,
    'constructive.allow_super_constructive': 'true',
  });

  // ---- 1. Ensure the site (lookup first — the verb is NOT idempotent). ----
  // sites_provision_static_site creates the bucket, the site, web config, the
  // 404 page, claims-or-reuses the localhost domains row, and the '/' root
  // route. Gated on manage_sites in the org owning the database; raises
  // DOMAIN_ALREADY_CLAIMED if another database holds the hostname.
  const existingSite = await client.query(
    `SELECT id FROM routing_public.sites WHERE database_id = $1 AND name = $2`,
    [tenantDatabaseId, SITE_NAME]
  );
  let siteId: string;
  if (existingSite.rowCount === 0) {
    const created = await tx(client, tenantClaims, () =>
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

  // ---- 2. DURABLE hostname verification — the source, not the index. ----
  // routing_public.hostname_bindings is a COMPILED INDEX maintained by the
  // domains sync trigger (it copies verification_status from NEW on every
  // insert/update of domains). Writing the index directly is silently reverted
  // by the next domains-row touch. resolve_route filters
  // hostname_bindings.verification_status = 'verified', so the durable write is
  // on routing_public.domains; the index is then read back to confirm.
  const verified = await tx(client, tenantClaims, () =>
    client.query(
      `UPDATE routing_public.domains
          SET verification_status = 'verified', verified_at = now()
        WHERE hostname = $1 AND database_id = $2`,
      [DOMAIN, tenantDatabaseId]
    )
  );
  if (verified.rowCount !== 1) {
    throw new Error(
      `domain '${DOMAIN}' row for tenant ${tenantDatabaseId} not found — create-db or the ` +
        `site verb must claim it first (or another database holds it — the site verb ` +
        `would have raised DOMAIN_ALREADY_CLAIMED)`
    );
  }
  const hb = await client.query(
    `SELECT verification_status FROM routing_public.hostname_bindings WHERE hostname = $1`,
    [DOMAIN]
  );
  if ((hb.rows[0] as { verification_status: string } | undefined)?.verification_status !== 'verified') {
    throw new Error(
      `hostname_bindings for '${DOMAIN}' did not recompile to 'verified' — the domains sync trigger ` +
        `may be missing; resolve_route would 404 every bound path`
    );
  }
  console.log(`hostname: '${DOMAIN}' verified (loopback can never fail a DNS check)`);

  // The localhost domains row id — pinned for the anonymous-flag update so a
  // second site later cannot flip flags on paths it shares.
  const domainRow = await client.query(
    `SELECT id FROM routing_public.domains WHERE hostname = $1 AND database_id = $2`,
    [DOMAIN, tenantDatabaseId]
  );
  if (domainRow.rowCount === 0) throw new Error(`domain '${DOMAIN}' row vanished after verification`);
  const domainId = (domainRow.rows[0] as { id: string }).id;

  // ---- 3. canonical_url — oauth_start composes the callback from this. ----
  await tx(client, tenantClaims, () =>
    client.query(
      `INSERT INTO routing_public.site_metadata (database_id, site_id, canonical_url)
       VALUES ($1, $2, $3)
       ON CONFLICT (site_id) DO UPDATE SET canonical_url = EXCLUDED.canonical_url`,
      [tenantDatabaseId, siteId, APP_ORIGIN]
    )
  );
  console.log(`site_metadata: canonical_url = ${APP_ORIGIN}`);

  // ---- 4. Mantra page set via the blessed install verb. ----
  const mantraReport = await tx(client, tenantClaims, () =>
    client.query(`SELECT routing_public.sites_install_mantra(site_id := $1, route_preset := $2)`, [
      siteId,
      MANTRA_PRESET_SLUG,
    ])
  );
  console.log(`mantra: installed preset '${MANTRA_PRESET_SLUG}' (report: ${JSON.stringify(mantraReport.rows[0])})`);

  // ---- 4b. The tenant's invocation plane — upstream gap remainder. ----
  // (Status at fd0bf6e6fdc: the anonymous-ledger gap and the entity_field
  // overwrite are FIXED upstream — definitions declare anonymous_callable, the
  // invocation carries route_binding_id, and the tracker's scopeKeyOwner stops
  // actor attribution from reaching the scope-key column. The old workaround
  // block (entity_field NULL updates, grants to anonymous, local_dev policies,
  // tenant-local registration of who_am_i/sign_out) is GONE — tenant-local
  // definitions would shadow the platform ones and defeat the frame chain.)
  // What remains: request-role invocation creation (create_invocation.sql,
  // insertRunningAsRequest) still expects a function_invocation_module at
  // exactly the addressed database and scope, and no preset provisions one for
  // a pure consumer tenant. Provision the bare plane — generated shapes
  // untouched — and raise the provisioning gap upstream (Dan ask #3).
  await tx(client, superClaims, async () => {
    const fm = await client.query(
      `SELECT 1 FROM metaschema_modules_public.function_module WHERE database_id = $1 AND scope = 'database'`,
      [tenantDatabaseId]
    );
    if (fm.rowCount === 0) {
      await client.query(
        `INSERT INTO metaschema_modules_public.function_module (database_id, scope) VALUES ($1, 'database')`,
        [tenantDatabaseId]
      );
    }
    // Idempotent per (database_id, scope); the insert trigger generates the
    // ledger tables with their own grants/policies — never mutate them.
    await client.query(
      `SELECT metaschema_generators.get_or_create_function_invocation_module(
         v_database_id := $1, v_scope := 'database', v_prefix := '',
         v_entity_table_id := NULL,
         v_invocations_table_name := 'function_invocations',
         v_execution_logs_table_name := 'function_execution_logs',
         v_attempts_table_name := 'function_invocation_attempts',
         v_policies := NULL, v_provisions := NULL)`,
      [tenantDatabaseId]
    );
    // The per-tenant sync verb. Upstream emits <invocations>_create_sync only
    // once BOTH planes of the same scope exist — its module triggers call
    // invocation_sync_verb and it emits on the second arrival. A pure consumer
    // tenant routes through the SHARED routing_public plane, so that second
    // (per-tenant routes plane) arrival never happens and the request-role
    // insert surface never appears in the tenant's schema: the gateway's
    // anonymous lanes then fail with "function ..._create_sync(...) does not
    // exist" (verified 2026-09-01 on fd0bf6e6fdc). Emit it directly, pointed
    // at the shared routes plane and the shared functions catalog — the
    // emitted body proves an anonymous caller's route_binding_id against
    // routing_public.routes either way. Idempotent (the generator's pg_proc
    // check makes re-runs no-ops). Raise alongside the plane gap (Dan ask #3).
    const verb = await client.query(
      `SELECT metaschema_generators.invocation_sync_verb(
           database_id := $1, scope := 'database',
           invocations_table_id := im.invocations_table_id,
           invocations_key := im.entity_field,
           routes_table_id := rm.routes_table_id,
           routes_key := rm.entity_field,
           functions_catalog_table_id := cat.id)
       FROM metaschema_modules_public.function_invocation_module im
       CROSS JOIN metaschema_modules_public.route_module rm
       CROSS JOIN (
         SELECT t.id FROM metaschema_public.table t
         JOIN metaschema_public.schema s ON s.id = t.schema_id
         WHERE s.name = 'catalog_private' AND t.name = 'functions'
       ) cat
       WHERE im.database_id = $1 AND im.scope = 'database'
         AND rm.scope = 'database' AND rm.public_schema_name = 'routing_public'`,
      [tenantDatabaseId]
    );
    if (verb.rowCount === 0) {
      throw new Error('invocation_sync_verb emission matched no planes — shared routing_public plane missing');
    }
  });
  console.log(`invocation plane: database-scope function + invocation modules ready, sync verb emitted (generated shapes untouched)`);

  // ---- 5. Sync + sso lanes, one custom doc. ----
  // Every flag mirrors the task manifest's `anonymousAccess` (the definition
  // already registered it as anonymous_callable; the route flag is the second
  // half of the pair). sso:link is deliberately authenticated — spending a
  // link ticket requires the signed-in owner of the email. All other flags
  // pre-auth lanes (session probe, OAuth start, the provider return leg, the
  // password verbs) are anonymous. Paths match each manifest's own route.
  const bindings: RouteBinding[] = [
    { path: '/auth/who-am-i', target: 'function', task_identifier: 'auth_flows:who_am_i', anonymous: true },
    { path: '/auth/sign-out', target: 'function', task_identifier: 'auth_flows:sign_out', anonymous: true },
    { path: '/auth/sign-in', target: 'function', task_identifier: 'auth_flows:sign_in', anonymous: true },
    { path: '/auth/forgot-password', target: 'function', task_identifier: 'auth_flows:forgot_password', anonymous: true },
    { path: '/auth/reset-password', target: 'function', task_identifier: 'auth_flows:reset_password', anonymous: true },
    { path: '/start', target: 'function', task_identifier: 'sso:start', anonymous: true },
    { path: '/sso/callback', target: 'function', task_identifier: 'sso:callback', anonymous: true },
    { path: '/auth/link', target: 'function', task_identifier: 'sso:link' },
  ];
  const installReport = await tx(client, tenantClaims, () =>
    client.query(
      `SELECT function_resolution.install_route_bindings(
         database_id := $1, sites_schema := 'routing_public', sites_table := 'sites',
         site_id := $2, bindings := $3::jsonb) AS report`,
      [tenantDatabaseId, siteId, JSON.stringify(bindings)]
    )
  );
  const report = (installReport.rows[0] as { report: { domain_id: string; installed: string[]; skipped: string[] } }).report;
  // The engine picks the install domain from the site's first route; assert it
  // is OUR localhost claim rather than trusting it (F5).
  if (report.domain_id !== domainId) {
    throw new Error(
      `install_route_bindings bound to domain ${report.domain_id}, not the localhost claim ${domainId}`
    );
  }
  console.log(
    `sync lanes: installed [${report.installed.join(', ')}]${
      report.skipped.length ? ` skipped [${report.skipped.join(', ')}]` : ''
    }`
  );

  // ---- 6. Verification walk — every bound path must resolve. ----
  // (The typed `anonymous` flag above travels in the binding document itself;
  // the old post-install routes.config UPDATE is gone.)
  const mantraBindings = (
    await client.query(
      `SELECT metaschema_generators.content_preset_definition('route_bindings', $1) AS bindings`,
      [MANTRA_PRESET_SLUG]
    )
  ).rows[0] as { bindings: Array<{ path: string; task_identifier: string }> };
  const allPaths: Array<{ path: string; task: string }> = [
    ...mantraBindings.bindings.map((b) => ({ path: b.path, task: b.task_identifier })),
    ...bindings.map((b) => ({ path: b.path, task: b.task_identifier })),
  ];
  const seen = new Set<string>();
  for (const { path } of allPaths) {
    if (seen.has(path)) throw new Error(`path '${path}' bound twice in the route set`);
    seen.add(path);
  }
  for (const { path, task } of allPaths) {
    const answer = await client.query(
      `SELECT target_module, resolved_config FROM routing_public.resolve_route($1, $2, 'GET')`,
      [DOMAIN, path]
    );
    const row = answer.rows[0] as
      | { target_module: string; resolved_config: Record<string, unknown> }
      | undefined;
    if (!row || row.target_module !== 'function') {
      throw new Error(`${DOMAIN}${path} does not resolve to a function target (got ${row?.target_module ?? 'nothing'})`);
    }
    const rc = row.resolved_config ?? {};
    if (rc.task_identifier !== task) {
      throw new Error(`${DOMAIN}${path} resolves to '${String(rc.task_identifier)}', not '${task}'`);
    }
    // mantra paths carry the serving site; sync lanes do not need to.
    const isMantra = mantraBindings.bindings.some((b) => b.path === path);
    if (isMantra && rc.site_id !== siteId) {
      throw new Error(`${DOMAIN}${path} serves site '${String(rc.site_id)}', not '${siteId}'`);
    }
    console.log(`  ${DOMAIN}${path} -> ${task}${isMantra ? ` (site ${siteId})` : ''}`);
  }

  // ---- 7. Site root '/' resolves to an app-origin redirect. ----
  // The mantra pages' post-auth landing is '/' (same-origin `next` only —
  // open-redirect guard). A redirect row is tenant-configured data, exempt
  // from the guard, so a redirect route at '/' turns that landing into an
  // instant hop into the app; the session cookie is already on localhost
  // (cookies ignore ports).
  // Shape: TWO routes at '/', never an in-place repoint — the site keeps its
  // own '/' route because sites_install_mantra/install_route_bindings refuse
  // to run for a site that "serves no hostname" (ROUTE_BINDINGS_SITE_NOT_ROUTED
  // on re-run). The redirect route carries priority 10 and resolve_route orders
  // priority DESC, so it wins while the site route keeps the verbs satisfied.
  // Idempotent: upsert the redirect row by (database_id, name); insert the
  // redirect route only when missing.
  await tx(client, tenantClaims, async () => {
    const redirect = await client.query(
      `INSERT INTO routing_public.redirects
         (database_id, name, to_host, to_path, status_code, preserve_path, preserve_query)
       VALUES ($1, 'app-origin', $2, '/', 302, false, true)
       ON CONFLICT (database_id, name) DO UPDATE SET
         to_host = EXCLUDED.to_host, to_path = EXCLUDED.to_path,
         status_code = EXCLUDED.status_code, preserve_path = EXCLUDED.preserve_path,
         preserve_query = EXCLUDED.preserve_query, updated_at = now()
       RETURNING id`,
      [tenantDatabaseId, REDIRECT_TO_HOST]
    );
    const redirectId = (redirect.rows[0] as { id: string }).id;
    const inserted = await client.query(
      `INSERT INTO routing_public.routes (database_id, domain_id, path, target_redirect_id, priority, is_active)
       SELECT $1::uuid, $2::uuid, '/', $3::uuid, 10, true
        WHERE NOT EXISTS (
          SELECT 1 FROM routing_public.routes x
           WHERE x.database_id = $1 AND x.domain_id = $2 AND x.path = '/' AND x.target_redirect_id = $3
        )
       RETURNING id`,
      [tenantDatabaseId, domainId, redirectId]
    );
    if (inserted.rowCount === 0) {
      const stillThere = await client.query(
        `SELECT 1 FROM routing_public.routes
          WHERE database_id = $1 AND domain_id = $2 AND path = '/' AND target_redirect_id = $3`,
        [tenantDatabaseId, domainId, redirectId]
      );
      if (stillThere.rowCount === 0) {
        throw new Error('app-origin redirect route at "/" was neither inserted nor present');
      }
    }
  });
  const rootLane = await client.query(
    `SELECT serving_lane, resolved_config->>'to_host' AS to_host
       FROM routing_public.resolve_route($1, '/', 'GET')`,
    [DOMAIN]
  );
  const root = rootLane.rows[0] as { serving_lane: string; to_host: string } | undefined;
  if (root?.serving_lane !== 'redirect' || root.to_host !== REDIRECT_TO_HOST) {
    throw new Error(
      `root '/' does not resolve to the app-origin redirect (lane ${root?.serving_lane ?? 'none'}, to_host ${root?.to_host ?? 'none'})`
    );
  }
  console.log(`site root: '/' -> 302 ${REDIRECT_TO_HOST}/ (app-origin redirect, priority over the site route)`);

  console.log(
    `tenant ${tenantDatabaseId}: site '${SITE_NAME}' provisioned, mantra + sync lanes bound, ${allPaths.length} route(s) resolving on ${DOMAIN}`
  );

  await client.end();
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? (err.stack ?? err.message) || String(err) : String(err));
  process.exit(1);
});
