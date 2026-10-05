#!/usr/bin/env bash
# local:bringup — reproducible cloud-function SSO bring-up, from a fresh platform.
#
# PREREQUISITE (manual, not this script): the platform is up —
#   cd constructive-db/compute && fun up --alt-ports
# with the port-forward on :15432 and the CoreDNS guard applied (README Part A).
#
# Sequence (each step re-runnable alone):
#   1. Verify the platform Postgres + repoint CoreDNS at public DNS (the
#      Docker Desktop DNS proxy dies after host sleep/restarts; without this
#      the OAuth token exchange fails with SSO_PROVIDER_TOKEN_EXCHANGE_FAILED).
#   2. Establish the owner (sign-up/sign-in on the platform auth lane; needs
#      OWNER_EMAIL/OWNER_PASSWORD in .env) and provision the tenant owned by
#      that user (b2b:storage warm claim). Ownership follows the caller —
#      never platform-bootstrap.
#   3. LEGACY ONLY (no OWNER_USER_ID): seed the machine owner's
#      self-membership. Owner-mode tenants get it from the owner bootstrap —
#      this step skips itself.
#   4. Register the shared functions at the platform (fun register --apply
#      --as platform-bootstrap — platform-scope registration is that
#      principal's job) and ensure the tenant's site + routes on 'localhost'
#      (provision ensure-site: site verb + mantra install + sync lanes,
#      consuming the platform's shared images via the frame chain. NO
#      per-tenant registrations). Includes repointing the site root '/' at the
#      app origin (redirect row) so mantra post-auth landings hop into :3000.
#   5. Publish the site homepage: wait for the bucket's physical provisioning
#      (storage:provision_bucket, fixed upstream 5e9605e2c50) and upload
#      assets/homepage/index.html — an empty bucket serves Not Found at '/'.
#   6. Wait for the registered deployments to render, then requeue any job
#      the render race killed (see the comment at the step itself).
#   7. Add the 'localhost' rule to the sync-gateway ingress (checks first).
#   8. Configure the SSO provider (real Google from OAUTH_* in .env) + the
#      anonymous grants the sign-in lane needs, then the per-tenant lanes a
#      fresh cluster has none of, each idempotent: email (Mailpit sender),
#      SMS (twilio verify), the two-factor switch (TWO_FACTOR=on|off, default
#      on), org creation open to every member.
#   9. Regenerate the GraphQL SDK (pnpm codegen) from the tenant's live
#      admin-/auth-/api-<slug>.localhost GraphQL hosts (port 80; the slug is
#      the NEXT_PUBLIC_DB_NAME create-db writes), once the admin host answers
#      a GraphQL query. src/graphql/sdk/ is committed generated output — this
#      is a no-op diff when the platform schema hasn't drifted and a healing
#      refresh when it has. The app context (business data) has no tables on
#      this template; codegen.sh keeps the previous sdk/app in that case. Not
#      fatal: a failed refresh leaves the committed SDK and is reported.
#  10. Next.js on :3000.
#
# NOTE: the old "provision the rate-limiter stack" step is gone — the
# b2b:storage preset ships plans/billing/rate_limit_meters since upstream
# fac0698a8ce (2026-09-08). Tenants created before that date were provisioned
# manually once and need nothing.
#
# The CNC GraphQL server and the mock OAuth server are NOT part of this
# bring-up: the SSO lane is served by functions/sso + functions/auth through
# the compute sync gateway (http://localhost — Traefik port 80).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
DB_REPO="${CONSTRUCTIVE_DB_DIR:-$ROOT_DIR/../../../constructive-db}"

# A fresh clone needs .env (owner + provider credentials) before anything;
# without it the source below fails with a bare error.
if [ ! -f "$ROOT_DIR/.env" ]; then
  echo "  ✗ $ROOT_DIR/.env not found — copy .env.example to .env, fill OWNER_EMAIL/OWNER_PASSWORD (+ OAUTH_*), then re-run"
  exit 1
fi

# Load .env so every step sees the same values.
set -a
# shellcheck disable=SC1091
source "$ROOT_DIR/.env"
set +a

# Same story for dependencies: every step below runs a pnpm script, and a
# just-pulled clone has no node_modules.
if [ ! -d "$ROOT_DIR/node_modules" ]; then
  echo "[0/10] Installing dependencies (pnpm install)..."
  (cd "$ROOT_DIR" && pnpm install)
fi

PGHOST="${PGHOST:-localhost}"
PGPORT="${PGPORT:-15432}"
PGDATABASE="${PGDATABASE:-constructive-functions-db1}"

echo "[1/10] Verifying the compute platform..."
if ! psql -h "$PGHOST" -p "$PGPORT" -U "${PGUSER:-postgres}" -d "$PGDATABASE" -c 'select 1' >/dev/null 2>&1; then
  echo "  ✗ Platform Postgres not reachable on :$PGPORT — run: cd constructive-db/compute && fun up --alt-ports"
  exit 1
fi
echo "  ✓ Platform Postgres reachable"

echo "[2/10] Establishing the owner and provisioning the tenant..."
(cd "$ROOT_DIR" && pnpm run owner-login)
# owner-login may have rewritten OWNER_USER_ID in .env; the values exported
# above are stale by now, and dotenv never overrides an exported variable —
# clear them, then re-source so create-db sees the fresh id.
unset OWNER_USER_ID DATABASE_ID
set -a
# shellcheck disable=SC1091
source "$ROOT_DIR/.env"
set +a
(cd "$ROOT_DIR/packages/provision" && pnpm run create-db)
# create-db rewrites DATABASE_ID / OWNER_USER_ID in .env; reload again for the
# same reason — exported values are stale and dotenv will not override them.
unset OWNER_USER_ID DATABASE_ID
set -a
# shellcheck disable=SC1091
source "$ROOT_DIR/.env"
set +a
if [ -z "${DATABASE_ID:-}" ]; then
  echo "  ✗ DATABASE_ID missing after provisioning"
  exit 1
fi

if [ -z "${OWNER_USER_ID:-}" ]; then
  echo "[3/10] LEGACY machine-owner mode: seeding the owner's self-membership..."
  (cd "$ROOT_DIR/packages/dev-local" && pnpm run ensure-owner-self-membership)
else
  echo "[3/10] Owner mode (OWNER_USER_ID set) — membership seed skipped (owner bootstrap mints it)"
fi

echo "[4/10] Registering shared functions + ensuring the tenant's site/routes on 'localhost'..."
# --as platform-bootstrap: fun register --apply requires an acting principal;
# platform-scope registration is exactly that principal's job (it never gains
# org reach). register auto-detects the live cluster context for its secret
# seeding; PGHOST/PGPORT are how THIS command reaches the port-forward.
(cd "$DB_REPO/compute" && \
  PGHOST="$PGHOST" PGPORT="$PGPORT" PGDATABASE="$PGDATABASE" \
  fun register --apply --as platform-bootstrap)
# Tenant side: ensure the site + bind routes, CONSUMING the platform's shared
# images through the frame chain. No per-tenant function registrations.
# Installs the mantra page set and the auth-flows/sso sync lanes.
(cd "$ROOT_DIR/packages/provision" && pnpm run ensure-site)

echo "[5/10] Publishing the site homepage (index.html)..."
# The bucket's physical provisioning is asynchronous: bucket insert auto-enqueues
# storage:provision_bucket, which (fixed upstream in 5e9605e2c50) resolves the
# shared database-scope storage plane and sets physical_name. Poll for it, then
# upload the placeholder homepage — the static gateway serves it at '/' (a
# provisioned-but-empty bucket answers Not Found; content is tenant-authored).
command -v mc >/dev/null 2>&1 || { echo "  ✗ mc (MinIO client) not on PATH"; exit 1; }
SITE_BUCKET_KEY="${DATABASE_NAME:-myapp}"
PHYS=""
for _ in $(seq 1 30); do
  PHYS=$(psql -h "$PGHOST" -p "$PGPORT" -U "${PGUSER:-postgres}" -d "$PGDATABASE" -Atc "
    SELECT physical_name FROM constructive_storage_public.buckets
     WHERE database_id = '${DATABASE_ID}'::uuid AND key = '${SITE_BUCKET_KEY}'" 2>/dev/null)
  [ -n "$PHYS" ] && break
  sleep 2
done
if [ -z "$PHYS" ]; then
  echo "  ✗ bucket '${SITE_BUCKET_KEY}' has no physical_name after 60s — check app_jobs.jobs for storage:provision_bucket"
  exit 1
fi
# Upstream's RustFS floor credentials (k8s/local/secrets.yaml): changed from
# minioadmin/minioadmin to constructive/constructive-dev-secret.
mc alias set localminio "http://localhost:${MINIO_API_PORT:-19000}" "${S3_ACCESS_KEY:-constructive}" "${S3_SECRET_KEY:-constructive-dev-secret}" >/dev/null
mc cp "$ROOT_DIR/assets/homepage/index.html" "localminio/${PHYS}/index.html"
echo "  ✓ homepage published to bucket '${PHYS}'"

# 4b. Wait for the registered deployments to render, then requeue any job the
# race killed: `fun register --apply` returns before the reconciler has given
# every function its service URL, and a schedule that fires in that window
# (billing:reconcile runs at :15 past every hour) dies for good — its fanout
# spec allows one attempt. "No service URL" is purely a not-yet-rendered
# deployment, so once every deployment is active those casualties are retried.
echo "[6/10] Waiting for registered deployments to render..."
for _ in $(seq 1 60); do
  PENDING=$(PGPASSWORD="${PGPASSWORD:-password}" psql -h "$PGHOST" -p "$PGPORT" -U "${PGUSER:-postgres}" -d "$PGDATABASE" -Atc "
    SELECT count(*) FROM compute_public.platform_function_deployments WHERE status <> 'active'" 2>/dev/null)
  [ "$PENDING" = "0" ] && break
  sleep 2
done
echo "  ✓ deployments active"
REQUEUED=$(PGPASSWORD="${PGPASSWORD:-password}" psql -h "$PGHOST" -p "$PGPORT" -U "${PGUSER:-postgres}" -d "$PGDATABASE" -Atc "
  WITH raced AS (
    UPDATE app_jobs.jobs
       SET attempts = 0, run_at = now(), locked_at = NULL, locked_by = NULL, last_error = NULL
     WHERE last_error LIKE 'No service URL%' AND attempts >= max_attempts
    RETURNING 1)
  SELECT count(*) FROM raced" 2>/dev/null)
[ "$REQUEUED" != "0" ] && echo "  ✓ requeued $REQUEUED job(s) that raced a rendering deployment"

echo "[7/10] Adding the 'localhost' rule to the sync-gateway ingress..."
if ! kubectl get ingress constructive-route-hosts -n constructive-platform-default >/dev/null 2>&1; then
  echo "  ✗ ingress constructive-route-hosts not found — is the platform up?"
  exit 1
fi
# Exact host match: -w would falsely match app.localhost ('.' is a non-word
# char to grep), silently skipping the rule the whole SSO lane depends on.
if ! kubectl get ingress constructive-route-hosts -n constructive-platform-default -o jsonpath='{.spec.rules[*].host}' | tr ' ' '\n' | grep -qx 'localhost'; then
  kubectl patch ingress constructive-route-hosts -n constructive-platform-default --type=json \
    -p='[{"op":"add","path":"/spec/rules/-","value":{"host":"localhost","http":{"paths":[{"backend":{"service":{"name":"compute-sync-svc","port":{"number":8789}}},"path":"/","pathType":"Prefix"}]}}}]'
fi
echo "  ✓ localhost -> compute-sync-svc"

echo "[8/10] Configuring the SSO provider..."
(cd "$ROOT_DIR/packages/provision" && pnpm run provision)

# The per-tenant lanes a fresh cluster has none of. Each script is
# idempotent and self-heals what it needs (internal store modules, the
# email sender module) — re-running the whole bring-up is safe.
echo "[8b/10] Configuring the email lane (smtp -> Mailpit)..."
(cd "$ROOT_DIR/packages/provision" && pnpm run configure-email)
echo "[8c/10] Configuring the SMS lane (twilio verify)..."
(cd "$ROOT_DIR/packages/provision" && pnpm run configure-sms)
echo "[8d/10] Setting the two-factor switch (TWO_FACTOR=${TWO_FACTOR:-on})..."
(cd "$ROOT_DIR/packages/provision" && pnpm run configure-2fa)
echo "[8e/10] Opening org creation to every member..."
(cd "$ROOT_DIR/packages/provision" && pnpm run configure-orgs)

echo "[9/10] Regenerating the GraphQL SDK (pnpm codegen)..."
# codegen introspects the tenant's live GraphQL hosts (admin-/auth-/api-<slug>
# .localhost, port 80); the slug is the NEXT_PUBLIC_DB_NAME create-db wrote.
# A fresh tenant's first GraphQL hit can wait on routing and schema
# cold-start, so wait for a real GraphQL answer: `{__typename}` answered 200.
# Any HTTP status is not enough — the edge answers 404 for a host it has no
# route for yet.
#
# The step is not fatal. src/graphql/sdk/ is committed and codegen.sh restores
# it on any failure, so the app runs on the committed SDK either way; a failed
# refresh is reported loudly and the bring-up continues to the dev server.
DB_SLUG="${NEXT_PUBLIC_DB_NAME:?NEXT_PUBLIC_DB_NAME missing — create-db did not write the tenant slug to .env}"
GRAPHQL_READY=0
for _ in $(seq 1 30); do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" -m 5 -X POST \
    -H 'content-type: application/json' -d '{"query":"{__typename}"}' \
    "http://admin-${DB_SLUG}.localhost/graphql" 2>/dev/null || true)
  if [ "$CODE" = "200" ]; then GRAPHQL_READY=1; break; fi
  sleep 2
done
if [ "$GRAPHQL_READY" != "1" ]; then
  echo "  ⚠ admin-${DB_SLUG}.localhost/graphql never answered {__typename} (last status: ${CODE:-none}) — skipping codegen; the committed SDK stays in place"
elif ! (cd "$ROOT_DIR" && pnpm codegen); then
  echo "  ⚠ codegen failed — the committed SDK was restored and stays in place; re-run 'pnpm codegen' once the cause above is fixed"
else
  echo "  ✓ SDK regenerated (git diff src/graphql/sdk shows any platform drift)"
fi

echo "[10/10] Starting Next.js on :3000..."
cd "$ROOT_DIR"
exec pnpm dev
