/**
 * ensure-owner-self-membership — LOCAL shortcut for a machine-owned tenant.
 *
 * The manage_sites gate on sites_provision_static_site is correct by design
 * (Dan, 8-31 SPRT verdict): it reads the owning org's SPRT, keyed by the
 * acting principal's USER id. A PERSONAL owner passes out of the box —
 * org_mbr_create writes every type-1 user a self-membership (actor = entity =
 * user, is_owner, full capability mask) at signup. A MACHINE owner does not:
 * platform-bootstrap is type 3 and deliberately gets no org reach, so a tenant
 * it owns has no identity with manage_sites and the gate refuses.
 *
 * STILL REQUIRED as of fd0bf6e6fdc (re-verified 2026-09-01 on a fresh
 * fun-up bring-up: ensure-site fails NOT_AUTHORIZED at the site verb without
 * this seed). Dan's sanctioned unattended shape is an org principal/API key
 * minted for the owning org (create_org_principal → the principal-sync
 * trigger materializes the SPRT rows). Until bring-up mints one, this script
 * takes the shorter path: it seeds the owner's own self-membership — the
 * exact row a type-1 signup would have earned. No separate org, no owner
 * re-point. Idempotent.
 *
 * Remove once the bring-up mints a proper org principal instead.
 */

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as dotenv from 'dotenv';
import { Client } from 'pg';

const MODULE_DIR = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(MODULE_DIR, '../../../.env') });

const env = process.env;
const PGHOST = env.PGHOST ?? 'localhost';
const PGPORT = Number(env.PGPORT ?? 15432);
const PGDATABASE = env.PGDATABASE ?? 'constructive-functions-db1';
const PGUSER = env.PGUSER ?? 'postgres';
const PGPASSWORD = env.PGPASSWORD ?? 'password';

const DATABASE_ID = env.DATABASE_ID;
const MANAGE_SITES_BITSTR = '0000000000000000000000000000000000000000000000000010000000000000';

async function main(): Promise<void> {
  if (!DATABASE_ID) throw new Error('DATABASE_ID is not set — run create-db first');

  const client = new Client({ host: PGHOST, port: PGPORT, database: PGDATABASE, user: PGUSER, password: PGPASSWORD });
  await client.connect();

  try {
    const owner = await client.query(`SELECT owner_id FROM metaschema_public.database WHERE id = $1`, [DATABASE_ID]);
    if (owner.rowCount === 0) throw new Error(`tenant database ${DATABASE_ID} not found`);
    const ownerId = (owner.rows[0] as { owner_id: string }).owner_id;

    // Idempotency: does the owner's self-membership already satisfy manage_sites?
    const has = await client.query(
      `SELECT EXISTS (
         SELECT 1 FROM constructive_memberships_private.org_memberships_sprt m
         WHERE m.actor_id = $1 AND m.entity_id = $1
           AND (m.capabilities & CAST($2 AS bit(64))) = CAST($2 AS bit(64))
       ) AS ok`,
      [ownerId, MANAGE_SITES_BITSTR]
    );
    if ((has.rows[0] as { ok: boolean }).ok) {
      console.log(`owner ${ownerId} already has a manage_sites self-membership — nothing to do`);
      return;
    }

    // The self-membership `org_mbr_create` writes for a type-1 user: actor =
    // entity = owner, is_owner. The membership triggers normalize is_owner to the
    // full capability mask and project it into the SPRT.
    await client.query(
      `INSERT INTO constructive_memberships_public.org_memberships
         (is_owner, is_admin, is_approved, is_active, actor_id, entity_id)
       VALUES (true, true, true, true, $1, $1)`,
      [ownerId]
    );

    const verify = await client.query(
      `SELECT constructive_memberships_private.org_memberships_perm_check('manage_sites', $1, $1) AS ok`,
      [ownerId]
    );
    if (!(verify.rows[0] as { ok: boolean }).ok) {
      throw new Error('self-membership written but org_memberships_perm_check still returns false');
    }
    console.log(`owner ${ownerId} self-membership ready (manage_sites in SPRT)`);
  } finally {
    await client.end();
  }
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? (err.stack ?? err.message) || String(err) : String(err));
  process.exit(1);
});
