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
#   3. Provision the rate-limiter stack (plans/billing/rate_limit_meters).
#      Upstream requirement for the sync-verb generator; not yet in the
#      b2b:storage preset. Idempotent.
#   4. LEGACY ONLY (no OWNER_USER_ID): seed the machine owner's
#      self-membership. Owner-mode tenants get it from the owner bootstrap —
#      this step skips itself.
#   5. Register the shared functions at the platform (fun register --apply
#      --as platform-bootstrap — platform-scope registration is that
#      principal's job) and ensure the tenant's site + routes on 'localhost'
#      (provision ensure-site: site verb + mantra install + sync lanes,
#      consuming the platform's shared images via the frame chain. NO
#      per-tenant registrations). Includes repointing the site root '/' at the
#      app origin (redirect row) so mantra post-auth landings hop into :3000.
#   5b. Publish the site homepage: wait for the bucket's physical provisioning
#       (storage:provision_bucket, fixed upstream 5e9605e2c50) and upload
#       assets/homepage/index.html — an empty bucket serves Not Found at '/'.
#   6. Add the 'localhost' rule to the sync-gateway ingress (checks first).
#   7. Configure the SSO provider (real Google from OAUTH_* in .env) + the
#      anonymous grants the sign-in lane needs, then start Next.js on :3000.
#
# The CNC GraphQL server and the mock OAuth server are NOT part of this
# bring-up: the SSO lane is served by functions/sso + functions/auth through
# the compute sync gateway (http://localhost — Traefik port 80).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
DB_REPO="${CONSTRUCTIVE_DB_DIR:-$ROOT_DIR/../../../constructive-db}"

# Load .env so every step sees the same values.
set -a
# shellcheck disable=SC1091
source "$ROOT_DIR/.env"
set +a

PGHOST="${PGHOST:-localhost}"
PGPORT="${PGPORT:-15432}"
PGDATABASE="${PGDATABASE:-constructive-functions-db1}"

echo "[1/7] Verifying the compute platform..."
if ! psql -h "$PGHOST" -p "$PGPORT" -U "${PGUSER:-postgres}" -d "$PGDATABASE" -c 'select 1' >/dev/null 2>&1; then
  echo "  ✗ Platform Postgres not reachable on :$PGPORT — run: cd constructive-db/compute && fun up --alt-ports"
  exit 1
fi
echo "  ✓ Platform Postgres reachable"

# Docker Desktop's built-in DNS (192.168.65.254) silently stops answering
# after host sleep/restarts; CoreDNS forwards there by default, so pods then
# fail EXTERNAL name resolution (OAuth token exchange dies with
# SSO_PROVIDER_TOKEN_EXCHANGE_FAILED). Re-point the forward at public DNS.
# Idempotent — no-op once patched.
if kubectl get configmap coredns -n kube-system -o jsonpath='{.data.Corefile}' 2>/dev/null | grep -q 'forward . /etc/resolv.conf'; then
  python3 - <<'PY'
import json, subprocess
cm = json.loads(subprocess.run(
    ['kubectl','get','configmap','coredns','-n','kube-system','-o','json'],
    capture_output=True, text=True).stdout)
corefile = cm['data']['Corefile'].replace(
    'forward . /etc/resolv.conf {', 'forward . 8.8.8.8 1.1.1.1 {')
print(subprocess.run(
    ['kubectl','patch','configmap','coredns','-n','kube-system','--type','merge',
     '-p', json.dumps({'data': {'Corefile': corefile}})],
    capture_output=True, text=True).stdout.strip())
PY
  kubectl rollout restart deploy/coredns -n kube-system >/dev/null 2>&1
  echo "  ✓ CoreDNS forward re-pointed to public DNS (Docker Desktop proxy guard)"
fi

echo "[2/7] Establishing the owner and provisioning the tenant..."
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

echo "[3/7] Provisioning the rate-limiter stack (plans/billing/meters)..."
# invocation_sync_verb hard-requires a tenant-scope rate_limit_meters_module
# before emitting the sync-lane writer; b2b:storage does not ship it (reported
# upstream). Guarded idempotency: the module row's insert is ON CONFLICT DO
# NOTHING, but re-provisioning an already-meters-equipped tenant trips a
# table-registration unique violation inside the generator — so only provision
# when the tenant has no working meters module yet.
psql -h "$PGHOST" -p "$PGPORT" -U "${PGUSER:-postgres}" -d "$PGDATABASE" -v ON_ERROR_STOP=1 -Atc "
SELECT count(*) FROM metaschema_modules_public.rate_limit_meters_module
 WHERE database_id = '${DATABASE_ID}'::uuid
   AND private_schema_id IS NOT NULL
   AND check_rate_limit_function <> ''" \
  | grep -qx 1 \
  || psql -h "$PGHOST" -p "$PGPORT" -U "${PGUSER:-postgres}" -d "$PGDATABASE" -v ON_ERROR_STOP=1 -c "
SELECT metaschema_generators.provision_database_modules(
  v_database_id := '${DATABASE_ID}'::uuid,
  v_public_schema_id := (SELECT id FROM metaschema_public.schema WHERE database_id='${DATABASE_ID}'::uuid AND schema_name='public'),
  v_private_schema_id := (SELECT id FROM metaschema_public.schema WHERE database_id='${DATABASE_ID}'::uuid AND schema_name='private'),
  v_modules := '[\"plans_module\",\"billing_module\",\"rate_limit_meters_module\"]'::jsonb);" >/dev/null
echo "  ✓ rate-limit meters ready"

if [ -z "${OWNER_USER_ID:-}" ]; then
  echo "[4/7] LEGACY machine-owner mode: seeding the owner's self-membership..."
  (cd "$ROOT_DIR/packages/dev-local" && pnpm run ensure-owner-self-membership)
else
  echo "[4/7] Owner mode (OWNER_USER_ID set) — membership seed skipped (owner bootstrap mints it)"
fi

echo "[5/7] Registering shared functions + ensuring the tenant's site/routes on 'localhost'..."
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

echo "[5b/7] Publishing the site homepage (index.html)..."
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
mc alias set localminio "http://localhost:${MINIO_API_PORT:-19000}" "${MINIO_ROOT_USER:-minioadmin}" "${MINIO_ROOT_PASSWORD:-minioadmin}" >/dev/null
mc cp "$ROOT_DIR/assets/homepage/index.html" "localminio/${PHYS}/index.html"
echo "  ✓ homepage published to bucket '${PHYS}'"

echo "[6/7] Adding the 'localhost' rule to the sync-gateway ingress..."
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

echo "[7/7] Configuring the SSO provider and starting Next.js on :3000..."
(cd "$ROOT_DIR/packages/provision" && pnpm run provision)

cd "$ROOT_DIR"
exec pnpm dev
