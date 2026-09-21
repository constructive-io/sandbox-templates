/**
 * owner-identity.ts — who provisioning acts as.
 *
 * Issue-2 correction: tenant setup must run as the database's OWNER, never as
 * platform-bootstrap. The platform's machine identity deliberately has zero org
 * reach (Dan's ruling, issue #1913): making it the tenant's owner — which the
 * legacy create-db path did — then required seeding org reach for it, i.e.
 * locally widening exactly the boundary that must stay closed.
 *
 * The owner is a real platform user established by `owner-login` (sign-up /
 * sign-in on the platform's auth GraphQL lane). Its USER id is what
 * request_database stamps as the tenant owner and what every SPRT row is keyed
 * by, so claims built from it satisfy the org gates the honest way.
 *
 * Legacy fallback: without OWNER_USER_ID the scripts still act as the
 * platform-bootstrap principal (the old machine-owner shape) and say so on
 * every run. The ensure-owner-self-membership seed exists only for that path.
 */
import type { Client } from 'pg';

export interface ActingUser {
  /** The USER id every claim carries (jwt.claims.user_id AND principal_id). */
  userId: string;
  /** 'owner' — a real platform user; 'legacy' — the machine principal. */
  mode: 'owner' | 'legacy';
}

export const BOOTSTRAP_PRINCIPAL = 'platform-bootstrap';

export async function resolveActingUser(
  client: Client,
  ownerUserId: string | undefined
): Promise<ActingUser> {
  if (ownerUserId) {
    // A human owner is a users row — principals are for service identities
    // (the auth lane's signUp creates a user, not a principal).
    const found = await client.query(
      `SELECT 1 FROM constructive_users_public.users WHERE id = $1 LIMIT 1`,
      [ownerUserId]
    );
    if (found.rowCount === 0) {
      throw new Error(
        `OWNER_USER_ID ${ownerUserId} matches no platform user — run 'pnpm run owner-login'`
      );
    }
    return { userId: ownerUserId, mode: 'owner' };
  }

  console.warn(
    '\n  [warn] No OWNER_USER_ID — acting as platform-bootstrap (legacy machine-owner mode).\n' +
      "         Run 'pnpm run owner-login' to provision as the tenant's real owner.\n"
  );
  const principal = await client.query(
    `SELECT user_id FROM constructive_auth_public.principals WHERE name = $1`,
    [BOOTSTRAP_PRINCIPAL]
  );
  if (principal.rowCount === 0) {
    throw new Error(
      `principal '${BOOTSTRAP_PRINCIPAL}' not found — fun up must have bootstrapped it`
    );
  }
  return { userId: (principal.rows[0] as { user_id: string }).user_id, mode: 'legacy' };
}

/**
 * The transaction-claims JSON every verb call in these scripts carries.
 *
 * Per the platform's session contract: principal_id holds the principal's USER
 * id — the value SPRT is keyed by — never principals.id.
 */
export const claimsFor = (databaseId: string, userId: string): string =>
  JSON.stringify({
    'jwt.claims.database_id': databaseId,
    'jwt.claims.user_id': userId,
    'jwt.claims.principal_id': userId
  });
