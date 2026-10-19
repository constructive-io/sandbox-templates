/**
 * configure-orgs — let every member create organizations, through the
 * tenant's admin GraphQL as its owner.
 *
 * A fresh tenant is strict on purpose: new members arrive unapproved and
 * unverified (their membership is inactive, so the RLS guards, which read
 * only active memberships, do not see it), and the default capability panel
 * is empty, so only owners and admins hold create_entity, the capability the
 * users INSERT policy demands for a type-2 "organization" row.
 *
 *   1. appMembershipDefault: isApproved + isVerified, so a new member's
 *      membership is active from sign-up.
 *   2. appCapabilityDefaultGrant for create_entity; its trigger adds the
 *      capability to the default panel every NEW membership inherits.
 *   3. LOCAL WORKAROUND (gap, not filed yet): the panel's recompute trigger on
 *      app_capability_default_capabilities is created BEFORE INSERT/UPDATE/
 *      DELETE (memberships_module passes v_timing := 2, PostgreSQL's BEFORE
 *      bit, under a comment that says AFTER), so it recomputes from a table
 *      that does not yet hold the row being inserted: the panel lands one
 *      grant behind (all zeros after the first grant). An UPDATE of that row
 *      to itself runs the same trigger while the row is present, so the panel
 *      comes out right. The admin API exposes no update on that table, so the
 *      no-op UPDATE runs in SQL as the owner's tenant session. Drop the step
 *      once the trigger fires AFTER.
 *
 * Existing members keep their flags and panel. Idempotent.
 */

import { Client } from 'pg';

import { pgConfig, required } from './env.js';
import { asSession, gql, tenantSession } from './realm.js';

const ADMIN = required('GRAPHQL_ADMIN_URL');

async function main(): Promise<void> {
  const owner = await tenantSession();
  const admin = <T>(query: string, variables: Record<string, unknown> = {}) =>
    gql<T>(ADMIN, query, variables, owner.token);

  // ---- 1. New members are active on arrival. ----
  const defaults = await admin<{ appMembershipDefaults: { nodes: Array<{ id: string; isApproved: boolean; isVerified: boolean }> } }>(
    `{ appMembershipDefaults { nodes { id isApproved isVerified } } }`
  );
  const singleton = defaults.appMembershipDefaults.nodes[0];
  if (!singleton) throw new Error('the tenant has no app membership defaults row');
  if (!singleton.isApproved || !singleton.isVerified) {
    await admin(
      `mutation ($id: UUID!) {
        updateAppMembershipDefault(input: { id: $id, appMembershipDefaultPatch: { isApproved: true, isVerified: true } }) {
          clientMutationId
        }
      }`,
      { id: singleton.id }
    );
  }
  console.log('membership defaults: new members arrive approved + verified');

  // ---- 2. create_entity joins the default panel. ----
  const capability = (
    await admin<{ appCapabilities: { nodes: Array<{ id: string; bitstr: string }> } }>(
      `{ appCapabilities(where: { name: { equalTo: "create_entity" } }) { nodes { id bitstr } } }`
    )
  ).appCapabilities.nodes[0];
  if (!capability) throw new Error('the tenant has no create_entity capability');
  const grants = await admin<{ appCapabilityDefaultGrants: { nodes: Array<{ id: string }> } }>(
    `query ($id: UUID!) { appCapabilityDefaultGrants(where: { capabilityId: { equalTo: $id } }) { nodes { id } } }`,
    { id: capability.id }
  );
  if (grants.appCapabilityDefaultGrants.nodes.length === 0) {
    await admin(
      `mutation ($id: UUID!) {
        createAppCapabilityDefaultGrant(input: { appCapabilityDefaultGrant: { capabilityId: $id, isGrant: true } }) {
          clientMutationId
        }
      }`,
      { id: capability.id }
    );
  }

  // ---- 3. LOCAL WORKAROUND: re-run the panel recompute with the row present. ----
  const joined = await admin<{ appCapabilityDefaultCapabilities: { nodes: Array<{ id: string }> } }>(
    `query ($id: UUID!) { appCapabilityDefaultCapabilities(where: { capabilityId: { equalTo: $id } }) { nodes { id } } }`,
    { id: capability.id }
  );
  const row = joined.appCapabilityDefaultCapabilities.nodes[0];
  if (!row) throw new Error('the create_entity grant added no row to the default panel');
  const client = new Client(pgConfig);
  await client.connect();
  await asSession(client, owner, owner.databaseId, async () => {
    const { rows } = await client.query(
      `SELECT format('%I.%I', s.schema_name, t.name) AS relation
         FROM metaschema_modules_public.memberships_module m
         JOIN metaschema_public.table t ON t.id = m.capability_default_capabilities_table_id
         JOIN metaschema_public.schema s ON s.id = t.schema_id
        WHERE m.database_id = $1 AND m.capability_default_capabilities_table_id IS NOT NULL
          AND m.entity_table_id IS NULL`,
      [owner.databaseId]
    );
    if (rows.length !== 1) throw new Error(`expected one app-scope default panel table, found ${rows.length}`);
    await client.query(`UPDATE ${(rows[0] as { relation: string }).relation} SET capability_id = capability_id WHERE id = $1`, [
      row.id
    ]);
  });
  await client.end();

  const panel = (
    await admin<{ appCapabilityDefaults: { nodes: Array<{ capabilities: string }> } }>(
      `{ appCapabilityDefaults { nodes { capabilities } } }`
    )
  ).appCapabilityDefaults.nodes[0]?.capabilities;
  const bit = capability.bitstr.indexOf('1');
  if (!panel || bit < 0 || panel[bit] !== '1') {
    throw new Error(`the default panel (${panel ?? 'none'}) does not hold create_entity (${capability.bitstr})`);
  }
  console.log(`default panel: ${panel} (holds create_entity) — every new member can create organizations`);
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? (err.stack ?? err.message) : String(err));
  process.exit(1);
});
