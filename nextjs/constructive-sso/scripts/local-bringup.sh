#!/usr/bin/env bash
# local:bringup — the SSO tenant on a running platform, from nothing to `pnpm dev`.
#
# PREREQUISITE (manual, not this script): the platform is up —
#   cd constructive-db/compute && fun up --alt-ports
# `fun up` already registers every shared function (mantra, sso, auth, email,
# sms, ...) at platform scope; a tenant consumes them and registers nothing.
#
# Who acts: the tenant's owner, a real user signed in with OWNER_EMAIL /
# OWNER_PASSWORD from .env — on the platform for platform-plane rows, on the
# tenant's own auth host for tenant rows (packages/provision/src/realm.ts).
# The few steps that are not the owner's are named LOCAL WORKAROUND or
# operator step at the place they run, with the reason and the issue.
#
#   1. Verify the platform Postgres.
#   2. create-db       owner (signed up on the first run), the local databases
#                      allowance (operator step), requestDatabase, wait for the
#                      reconciler's owner bootstrap, tenant coordinates -> .env.
#   3. ensure-site     site on SSO_ROUTE_HOST, mantra + sso presets, /auth/link,
#                      canonical_url, '/' -> app redirect.
#   4. configure-email the tenant's sender (Mailpit) in the platform's email plane.
#   5. configure-sms   Twilio Verify settings in the tenant's own app-scope
#                      stores, through the tenant's config API.
#   6. configure-sso   the Google provider row + its encrypted client secret.
#   7. configure-auth  the tenant's auth policy (sign-in lanes, cookie, 2FA:
#                      TWO_FACTOR=on|off, default on).
#   8. configure-orgs  every member may create organizations.
#   9. pnpm codegen    the GraphQL SDK from the tenant's live hosts (not fatal).
#  10. next dev on :3000.
#
# Every step is idempotent and can be re-run alone (pnpm run <step>). The auth
# policy step is guarded by the tenant's 2FA posture: inside six hours of the
# owner bootstrap the owner's password session may write it; after that it
# needs a fresh MFA proof (see configure-auth).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

if [ ! -f "$ROOT_DIR/.env" ]; then
  echo "  ✗ $ROOT_DIR/.env not found — copy .env.example to .env, fill OWNER_EMAIL/OWNER_PASSWORD (+ OAUTH_*, TWILIO_*), then re-run"
  exit 1
fi
set -a
# shellcheck disable=SC1091
source "$ROOT_DIR/.env"
set +a

# The one-host rule. The gateway's session cookie is host-only, so the app
# only sees it when the gateway's host (SSO_ROUTE_HOST) and the app's host
# (APP_ORIGIN's hostname) are the same cookie host — localhost vs
# myapp.localhost do NOT match, and the tenant sets no cookie_domain to
# bridge them. With different hosts every sign-in ends with the app still
# signed out and the home page bouncing to the gateway's /login forever.
ROUTE_HOSTNAME="$(printf '%s' "${SSO_ROUTE_HOST:-localhost}" | sed -E 's/:[0-9]+$//')"
APP_HOSTNAME="$(printf '%s' "${APP_ORIGIN:-http://localhost:3000}" | sed -E 's#^https?://##; s/:[0-9]+$//')"
if [ "$ROUTE_HOSTNAME" != "$APP_HOSTNAME" ]; then
  echo "  ✗ SSO_ROUTE_HOST ('$ROUTE_HOSTNAME') is a different cookie host than APP_ORIGIN ('$APP_HOSTNAME')."
  echo "    The gateway's host-only session cookie would never reach the app — every sign-in loops on /login."
  echo "    Fix: set SSO_ROUTE_HOST=$APP_HOSTNAME (and SSO_GATEWAY_URL=http://$APP_HOSTNAME) in .env, then re-run."
  exit 1
fi

if [ ! -d "$ROOT_DIR/node_modules" ]; then
  echo "[0/10] Installing dependencies (pnpm install)..."
  (cd "$ROOT_DIR" && pnpm install)
fi

step() { (cd "$ROOT_DIR" && pnpm run --silent "$1"); }
reload_env() {
  # A step rewrote .env; exported values are stale and dotenv never overrides
  # an exported variable, so clear what create-db writes and re-source.
  unset DATABASE_ID NEXT_PUBLIC_DB_NAME GRAPHQL_ADMIN_URL GRAPHQL_AUTH_URL
  set -a
  # shellcheck disable=SC1091
  source "$ROOT_DIR/.env"
  set +a
}

echo "[1/10] Verifying the compute platform..."
if ! PGPASSWORD="${PGPASSWORD:-password}" psql -P pager=off -h "${PGHOST:-localhost}" -p "${PGPORT:-15432}" \
    -U "${PGUSER:-postgres}" -d "${PGDATABASE:-constructive-functions-db1}" -c 'select 1' >/dev/null 2>&1; then
  echo "  ✗ Platform Postgres not reachable on :${PGPORT:-15432} — run: cd constructive-db/compute && fun up --alt-ports"
  exit 1
fi
echo "  ✓ Platform Postgres reachable"

echo "[2/10] The owner and the tenant..."
step create-db
reload_env

echo "[3/10] The tenant's site on '${SSO_ROUTE_HOST:-localhost}'..."
step ensure-site

echo "[4/10] The email sender (smtp -> Mailpit)..."
step configure-email
echo "[5/10] The SMS provider (Twilio Verify)..."
step configure-sms
echo "[6/10] The identity provider (${OAUTH_PROVIDER:-google})..."
step configure-sso
echo "[7/10] The auth policy (TWO_FACTOR=${TWO_FACTOR:-on})..."
step configure-auth
echo "[8/10] Organization creation for every member..."
step configure-orgs

echo "[9/10] Regenerating the GraphQL SDK (pnpm codegen)..."
# codegen introspects the tenant's live hosts (admin-/auth-<slug>.localhost,
# port 80). A fresh tenant's first GraphQL hit can wait on routing and schema
# cold-start, so wait for `{__typename}` to answer 200 — any HTTP status is not
# enough, the edge answers 404 for a host it has no route for yet. Not fatal:
# src/graphql/sdk/ is committed and codegen.sh restores it on any failure.
GRAPHQL_READY=0
for _ in $(seq 1 30); do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" -m 5 -X POST \
    -H 'content-type: application/json' -d '{"query":"{__typename}"}' "$GRAPHQL_ADMIN_URL" 2>/dev/null || true)
  if [ "$CODE" = "200" ]; then GRAPHQL_READY=1; break; fi
  sleep 2
done
if [ "$GRAPHQL_READY" != "1" ]; then
  echo "  ⚠ $GRAPHQL_ADMIN_URL never answered {__typename} (last status: ${CODE:-none}) — the committed SDK stays in place"
elif ! (cd "$ROOT_DIR" && pnpm codegen); then
  echo "  ⚠ codegen failed — the committed SDK was restored; re-run 'pnpm codegen' once the cause above is fixed"
else
  echo "  ✓ SDK regenerated (git diff src/graphql/sdk shows any platform drift)"
fi

echo "[10/10] Starting Next.js on :3000..."
cd "$ROOT_DIR"
exec pnpm dev
