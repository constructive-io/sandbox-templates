#!/usr/bin/env bash
# codegen.sh — run GraphQL SDK codegen without clobbering the project README.
#
# @constructive-io/graphql-codegen unconditionally writes a generated
# "GraphQL SDK" README.md at the project root for multi-target configs
# (generateRootRootReadme has no opt-out). Our README.md is hand-written
# documentation, so preserve it across the run.
#
# Targets run individually (-t): the generator fatally rejects a schema with
# no tables ("No tables found after filtering"), and the SSO tenant's app
# context (business data) is legitimately empty — admin and auth must still
# regenerate. On exactly that refusal the previous src/graphql/sdk/app is kept
# (the app only consumes its `configure` export at runtime; it regenerates
# once the tenant gains business tables). Any other failure — an unreachable
# host, a server error, a wrong slug — restores the whole SDK as it was before
# the run and exits non-zero.
#
# Each target's output directory is wiped before it is generated, so files for
# tables the platform no longer has do not linger. The restore copy is taken
# from the tree as it is, not from git, so it also works in a project copied
# from this template without history, and never discards an uncommitted
# regeneration.
#
# Arguments are forwarded to every target's run (e.g. --dry-run, -v).
#
# The generated READMEs name the endpoint they were generated from, which
# carries the tenant's slug; it is replaced with <tenant-slug> so regenerating
# on a fresh tenant (every bring-up makes one) is not a diff.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

SDK=./src/graphql/sdk
TARGETS=(admin auth app)
GEN=(npx @constructive-io/graphql-codegen generate --config ./graphql-codegen.config.ts)

PRESERVE="$(mktemp)"
BACKUP="$(mktemp -d)"
APP_LOG="$(mktemp)"
cp README.md "$PRESERVE"
cleanup() {
  cp "$PRESERVE" README.md
  rm -rf "$PRESERVE" "$BACKUP" "$APP_LOG"
}
trap cleanup EXIT

for t in "${TARGETS[@]}"; do
  if [ -d "$SDK/$t" ]; then cp -a "$SDK/$t" "$BACKUP/$t"; fi
done

restore_target() {
  rm -rf "${SDK:?}/$1"
  if [ -d "$BACKUP/$1" ]; then cp -a "$BACKUP/$1" "$SDK/$1"; fi
}

restore_all() {
  for t in "${TARGETS[@]}"; do restore_target "$t"; done
}

rm -rf "$SDK/admin" "$SDK/auth" "$SDK/app"

# admin/auth are the contexts this app consumes: either regenerates or the
# run changes nothing.
for t in admin auth; do
  if ! "${GEN[@]}" -t "$t" "$@"; then
    echo "  ✗ codegen failed for '$t' — the SDK is restored as it was" >&2
    restore_all
    exit 1
  fi
done

if ! "${GEN[@]}" -t app "$@" 2>&1 | tee "$APP_LOG"; then
  if grep -q 'No tables found after filtering' "$APP_LOG"; then
    restore_target app
    if [ ! -d "$SDK/app" ]; then
      echo "  ✗ app context has no tables and there is no previous src/graphql/sdk/app to keep" >&2
      exit 1
    fi
    echo "  → app context has no tables — keeping the previous src/graphql/sdk/app"
  else
    echo "  ✗ codegen failed for 'app' — the SDK is restored as it was" >&2
    restore_all
    exit 1
  fi
fi

SLUG="${NEXT_PUBLIC_DB_NAME:-$(sed -n 's/^NEXT_PUBLIC_DB_NAME=//p' .env 2>/dev/null | tr -d '"' | tail -n 1)}"
if [ -n "$SLUG" ]; then
  for t in "${TARGETS[@]}"; do
    if [ -f "$SDK/$t/README.md" ]; then
      SLUG="$SLUG" perl -pi -e 's/\Q$ENV{SLUG}\E/<tenant-slug>/g' "$SDK/$t/README.md"
    fi
  done
fi
