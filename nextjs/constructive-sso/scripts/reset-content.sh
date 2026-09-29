#!/usr/bin/env bash
# Reset the BOILERPLATE CONTENT only: drop this app's claimed tenant + the
# extra pool template it created, so `pnpm run local:bringup` provisions a
# fresh one. The platform (kind cluster, shared functions, warm pool stock)
# is untouched — no fun down, no fun up.
#
# What it removes (all scoped to the app's tenant):
#   - the tenant row in metaschema_public.database (cascades its routing/site
#     rows, jobs, and the app's claims; the gateway 404s it afterwards)
#   - the tenant's pool schemas (dropped with the row)
#   - the warm template the tenant claim minted (pool-… in the database
#     registry) so the next claim bakes from the CURRENT image
#   - .env's DATABASE_ID / OWNER_USER_ID (bringup rewrites them)
#
# Requires: the platform up, its postgres forward on PGPORT (per .env).
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
set -a; source "$ROOT_DIR/.env"; set +a
: "${DATABASE_ID:?DATABASE_ID missing — nothing to reset}"

PSQL=(psql -h "${PGHOST:-localhost}" -p "${PGPORT:-15432}" -U "${PGUSER:-postgres}" -d "${PGDATABASE:-constructive-functions-db1}")

# The warm template this tenant claim created (name = pool-...; the tenant row
# itself is 'myapp'). Deleting both frees the schemas and the claim.
POOL_DB=$("${PSQL[@]}" -Atc "SELECT id FROM metaschema_public.database WHERE name LIKE 'pool-%' AND id::text <> '${DATABASE_ID}'")
[ -n "$POOL_DB" ] && echo "      and its warm template ${POOL_DB}"

echo "[1/2] Dropping tenant ${DATABASE_ID}"
# The delete cascades into guarded tables (rls_settings carries a step-up
# posture whose trigger demands an authenticated user). This is a deliberate
# teardown by the superuser: session_replication_role=replica suspends every
# trigger for this session only, the deletes land, and the connection close
# restores them.
"${PSQL[@]}" -v ON_ERROR_STOP=1 <<SQL
SET session_replication_role = replica;
DELETE FROM metaschema_public.database WHERE id='${DATABASE_ID}'::uuid;
${POOL_DB:+DELETE FROM metaschema_public.database WHERE id='${POOL_DB}';}
SQL

echo "[2/2] Clearing the app's tenant identity from .env"
sed -E '/^(DATABASE_ID|OWNER_USER_ID)=/d' "$ROOT_DIR/.env" > "$ROOT_DIR/.env.tmp" && mv "$ROOT_DIR/.env.tmp" "$ROOT_DIR/.env"

echo "Done — the platform is untouched. Fresh tenant:"
echo "  cd $ROOT_DIR && pnpm run local:bringup"
