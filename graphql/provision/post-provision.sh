#!/bin/bash
set -euo pipefail

# Post-Provision SQL Workarounds
#
# The seeder CLI does not apply auto-verify-email or fix-membership-defaults.
# This script applies both workarounds for a given database.
#
# Usage: bash post-provision.sh <db_name>

DB_NAME="${1:?Usage: post-provision.sh <db_name>}"

# Resolve schema prefix from the membership schema
MEMBERSHIP_SCHEMA="$(psql -d constructive -t -c "
  SELECT table_schema FROM information_schema.tables
  WHERE table_name = 'app_membership_defaults'
    AND table_schema LIKE '${DB_NAME}-%memberships-public'
  ORDER BY table_schema LIMIT 1;" | tr -d ' ')"

if [ -z "$MEMBERSHIP_SCHEMA" ]; then
  echo "ERROR: Could not resolve membership schema for database '$DB_NAME'"
  exit 1
fi

SCHEMA_PREFIX="${MEMBERSHIP_SCHEMA%-memberships-public}"
echo "Resolved schema prefix: $SCHEMA_PREFIX"

# Workaround 1: auto-verify-email
EMAIL_SCHEMA="${SCHEMA_PREFIX}-user-identifiers-public"
echo "Applying auto-verify-email workaround on schema: $EMAIL_SCHEMA"
psql -d constructive -c "
  ALTER TABLE \"${EMAIL_SCHEMA}\".emails ALTER COLUMN is_verified SET DEFAULT true;
  UPDATE \"${EMAIL_SCHEMA}\".emails SET is_verified = true WHERE is_verified = false;
"

# Workaround 2: fix-membership-defaults
echo "Applying fix-membership-defaults workaround on schema: $MEMBERSHIP_SCHEMA"
psql -d constructive -c "
  UPDATE \"${MEMBERSHIP_SCHEMA}\".app_membership_defaults
    SET is_approved = true, is_verified = true;
"

echo "Post-provision workarounds applied successfully."

# Optional: register admin on per-database auth (fallback for seeder < 0.5.3)
if [ -n "${ADMIN_EMAIL:-}" ] && [ -n "${ADMIN_PASSWORD:-}" ]; then
  AUTH_ENDPOINT="http://auth-${DB_NAME}.localhost:3000/graphql"
  echo "Registering admin user on per-database auth: $AUTH_ENDPOINT"
  curl -s -X POST "$AUTH_ENDPOINT" \
    -H "Content-Type: application/json" \
    -d "{\"query\":\"mutation { signUp(input: {email: \\\"${ADMIN_EMAIL}\\\", password: \\\"${ADMIN_PASSWORD}\\\"}) { result { accessToken userId } } }\"}" \
    > /dev/null 2>&1 || true
  echo "Per-database admin registration attempted (errors are non-fatal)."
fi
