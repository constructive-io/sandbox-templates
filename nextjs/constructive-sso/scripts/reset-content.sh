#!/usr/bin/env bash
# Reset the BOILERPLATE CONTENT only: drop this app's claimed tenant + the
# warm template behind it, so `pnpm run local:bringup` provisions a fresh
# tenant baked from the CURRENT image. The platform (kind cluster, shared
# functions, warm-pool stock) is untouched — no fun down, no fun up.
#
# What it removes, all scoped to the app's tenant:
#   1. the tenant row + its warm template in metaschema_public.database
#      (the registry delete does NOT cascade, so the same transaction sweeps)
#   2. their db_pool rows (a stale `claimed` row pointing at a dropped
#      database is what makes the next request_database fail with
#      DATABASE_NOT_FOUND)
#   3. their domain rows in BOTH routing_public.domains AND its mirror
#      catalog_private.domains — the mirror is trigger-synced, and a stale
#      `localhost` there answers every later claim with DOMAIN_ALREADY_CLAIMED
#      or a domains_hostname_key duplicate
#   4. the orphaned pool-% schemas the suspended cleanup triggers would have
#      dropped asynchronously
#   5. .env's DATABASE_ID / OWNER_USER_ID (bringup rewrites them)
#
# Then it WAITS for the warm pool to replenish (the reconciler bakes a fresh
# template within ~2 minutes of the stock emptying; local:bringup racing an
# empty pool hits DATABASE_NOT_FOUND).
#
# The deletes run under session_replication_role=replica — a deliberate
# superuser teardown suspending every trigger for this session only; the
# guards on rls_settings/domains would otherwise demand an authenticated
# user. The connection close restores them.
#
# Requires: the platform up, its postgres forward on PGPORT (per .env).
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
set -a; source "$ROOT_DIR/.env"; set +a
: "${DATABASE_ID:?DATABASE_ID missing — nothing to reset}"

PSQL=(psql -h "${PGHOST:-localhost}" -p "${PGPORT:-15432}" -U "${PGUSER:-postgres}" -d "${PGDATABASE:-constructive-functions-db1}")

# The warm template backing this tenant (name = pool-…; the tenant row is the
# app's DATABASE_NAME). Both go, so the next claim bakes from the current image.
POOL_DB=$("${PSQL[@]}" -Atc "SELECT id FROM metaschema_public.database WHERE name LIKE 'pool-%' AND id::text <> '${DATABASE_ID}'")
echo "[1/3] Dropping tenant ${DATABASE_ID}"
[ -n "$POOL_DB" ] && echo "      and its warm template ${POOL_DB}"

"${PSQL[@]}" -v ON_ERROR_STOP=1 <<SQL
SET session_replication_role = replica;
DELETE FROM metaschema_modules_public.db_pool
 WHERE database_id IN ('${DATABASE_ID}', '${POOL_DB}')
    OR database_id NOT IN (SELECT id FROM metaschema_public.database);
DELETE FROM routing_public.domains
 WHERE database_id IN ('${DATABASE_ID}', '${POOL_DB}')
    OR database_id NOT IN (SELECT id FROM metaschema_public.database);
DELETE FROM catalog_private.domains
 WHERE database_id IN ('${DATABASE_ID}', '${POOL_DB}')
    OR database_id NOT IN (SELECT id FROM metaschema_public.database);
DELETE FROM metaschema_public.database
 WHERE id IN ('${DATABASE_ID}', '${POOL_DB}');
DO \$do\$
DECLARE n text;
BEGIN
  PERFORM set_config('session_replication_role', 'replica', false);
  FOR n IN SELECT quote_ident(nspname) FROM pg_namespace WHERE nspname LIKE 'pool-%' LOOP
    EXECUTE format('DROP SCHEMA %s CASCADE', n);
  END LOOP;
END
\$do\$;
SQL

echo "[2/3] Clearing the app's tenant identity from .env"
sed -E '/^(DATABASE_ID|OWNER_USER_ID)=/d' "$ROOT_DIR/.env" > "$ROOT_DIR/.env.tmp" && mv "$ROOT_DIR/.env.tmp" "$ROOT_DIR/.env"

echo "[3/3] Waiting for the warm pool to replenish (reconciler bakes fresh stock)…"
READY=0
for _ in $(seq 1 36); do
  READY=$("${PSQL[@]}" -Atc "
    SELECT count(*) FROM metaschema_modules_public.db_pool p
     WHERE p.status = 'ready'
       AND EXISTS (SELECT 1 FROM metaschema_public.database d WHERE d.id = p.database_id)" 2>/dev/null || echo 0)
  [ "${READY:-0}" -ge 1 ] && break
  sleep 5
done
if [ "${READY:-0}" -ge 1 ]; then
  echo "  ✓ warm template ready"
else
  echo "  ! no healthy warm template after 3 minutes — check the reconciler before bringup"
fi

echo "Done — the platform is untouched. Fresh tenant:"
echo "  cd $ROOT_DIR && pnpm run local:bringup"
