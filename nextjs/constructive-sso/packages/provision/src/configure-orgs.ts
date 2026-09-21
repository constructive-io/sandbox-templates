/**
 * configure-orgs — let every member create organizations.
 *
 * A fresh tenant is baked strict on purpose: app_membership_defaults says
 * new members arrive unapproved and unverified (so their app_memberships
 * row is inactive and invisible to the RLS guards, which read only the
 * active mirror app_memberships_sprt), and the default capability panel
 * app_capability_defaults is all zeros — so nobody but owner/admin holds
 * create_entity, the bit the users INSERT policy demands before it
 * accepts a type=2 "organization" row. The /organizations button mirrors
 * the same membership check and stays hidden for everyone else.
 *
 * This script opens both locks the way the platform designed (pure data —
 * nothing here can be regenerated away):
 *
 *   1. app_membership_defaults.is_approved / is_verified := true, so a new
 *      member's membership is active from the moment the sign-up trigger
 *      creates it.
 *   2. One app_capability_default_grants row for create_entity; the
 *      trigger chain recomputes app_capability_defaults, and every NEW
 *      membership inherits the bit via its insert trigger.
 *
 * Idempotent — both verbs are set-over-set. Members that already exist
 * keep their flags and panel (today that is only the owner, who already
 * holds everything). Run after promote-owner.
 */

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as dotenv from 'dotenv';
import { Client } from 'pg';

const MODULE_DIR = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(MODULE_DIR, '../../../.env') });

const env = process.env;

// The platform bootstrap copy is the only membership holder that must
// never be mistaken for the tenant owner.
const BOOTSTRAP_USER_ID = '00000000-0000-0000-0000-000000000003';

const required = (name: string): string => {
  const value = env[name];
  if (!value) throw new Error(`missing ${name} in the environment`);
  return value;
};

async function main(): Promise<void> {
  const DATABASE_ID = required('DATABASE_ID');
  const client = new Client({
    host: env.PGHOST ?? 'localhost',
    port: Number(env.PGPORT ?? 15432),
    database: env.PGDATABASE ?? 'constructive-functions-db1',
    user: env.PGUSER ?? 'postgres',
    password: env.PGPASSWORD ?? 'postgres',
  });
  await client.connect();

  // The tenant's physical schema prefix, resolved the same way
  // promote-owner does (from the identity module row) — never assumed.
  const identityModule = await client.query(
    `SELECT s.schema_name
     FROM metaschema_modules_public.identity_providers_module ipm
     JOIN metaschema_public.schema s ON s.id = ipm.private_schema_id
     WHERE ipm.database_id = $1 LIMIT 1`,
    [DATABASE_ID]
  );
  if (identityModule.rowCount === 0) {
    throw new Error(`no identity module for database ${DATABASE_ID}`);
  }
  const prefix = ((identityModule.rows[0] as { schema_name: string }).schema_name
    .split('-').slice(0, 3).join('-'));
  const memberships = `"${prefix}-memberships-public"`;
  const capabilities = `"${prefix}-capabilities-public"`;

  // ---- 1. New members are active on arrival. ----
  await client.query(
    `UPDATE ${memberships}.app_membership_defaults SET is_approved = TRUE, is_verified = TRUE`
  );
  console.log(`defaults: new members arrive approved + verified (membership active)`);

  // ---- 2. create_entity joins the default capability panel. ----
  // grantor_id defaults to jwt_public.current_user_id(), which is NULL on a
  // direct superuser connection — attribute the grant to the tenant owner.
  const owner = await client.query(
    `SELECT actor_id FROM ${memberships}.app_memberships
     WHERE is_owner AND actor_id <> $1 LIMIT 1`,
    [BOOTSTRAP_USER_ID]
  );
  if (owner.rowCount === 0) throw new Error('no owner membership — run promote-owner first');
  const grantor = (owner.rows[0] as { actor_id: string }).actor_id;

  const granted = await client.query(
    `INSERT INTO ${memberships}.app_capability_default_grants (capability_id, is_grant, grantor_id)
     SELECT c.id, TRUE, $1
     FROM ${capabilities}.app_capabilities c
     WHERE c.name = 'create_entity'
       AND NOT EXISTS (SELECT 1 FROM ${memberships}.app_capability_default_grants g
                       WHERE g.capability_id = c.id)`,
    [grantor]
  );
  console.log(
    `grant: create_entity ${granted.rowCount === 0 ? 'already on' : 'added to'} the default panel ` +
    `(attributed to the tenant owner)`
  );

  // ---- 3. Recompute the panel. ----
  // The recompute trigger on app_capability_default_capabilities fires
  // BEFORE INSERT, so it computes the mask from the table WITHOUT the row
  // being added — the singleton lands one grant behind (all zeros on the
  // first grant). Run the trigger's own math here so the panel is current.
  await client.query(
    `UPDATE ${capabilities}.app_capability_defaults
     SET capabilities = (
       SELECT coalesce(bit_or(p.bitstr), (lpad('', 64, '0'))::bit(64))
       FROM ${memberships}.app_capability_default_capabilities AS pp
       JOIN ${capabilities}.app_capabilities AS p ON p.id = pp.capability_id
     )`
  );

  // ---- Report the resulting state. ----
  const panel = await client.query(
    `SELECT capabilities::text AS mask FROM ${capabilities}.app_capability_defaults`
  );
  const mask = panel.rows[0] ? (panel.rows[0] as { mask: string }).mask : null;
  console.log(`panel: app_capability_defaults = ${mask ?? '(no singleton row)'}`);

  await client.end();
  console.log(`tenant ${DATABASE_ID}: every new member can create organizations (existing members unchanged)`);
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? (err.stack ?? err.message) || String(err) : String(err));
  process.exit(1);
});
