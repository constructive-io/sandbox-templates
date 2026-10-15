#!/usr/bin/env bash
# codegen.sh — run GraphQL SDK codegen without clobbering the project README.
#
# @constructive-io/graphql-codegen unconditionally writes a generated
# "GraphQL SDK" README.md at the project root for multi-target configs
# (generateRootRootReadme has no opt-out). Our README.md is hand-written
# documentation, so preserve it across the run.
#
# Targets run individually (-t): the generator fatally rejects a schema with
# no tables ("No tables found after filtering"). This template generates only
# the contexts it consumes — admin and auth; the app context (business data)
# has no tables on this template, so no app target exists (a template that
# gains business tables adds the target in graphql-codegen.config.ts).
#
# Each target's output directory is wiped before it is generated, so files for
# tables the platform no longer has do not linger. On any failure — an
# unreachable host, a server error, a wrong slug — the whole SDK is restored
# as it was before the run and the run exits non-zero. The restore copy is
# taken from the tree as it is, not from git, so it also works in a project
# copied from this template without history, and never discards an
# uncommitted regeneration.
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
TARGETS=(admin auth)
GEN=(npx @constructive-io/graphql-codegen generate --config ./graphql-codegen.config.ts)

PRESERVE="$(mktemp)"
BACKUP="$(mktemp -d)"
cp README.md "$PRESERVE"
cleanup() {
  cp "$PRESERVE" README.md
  rm -rf "$PRESERVE" "$BACKUP"
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

rm -rf "${TARGETS[@]/#/$SDK/}"

# admin/auth are the contexts this app consumes: either regenerates or the
# run changes nothing.
for t in "${TARGETS[@]}"; do
  if ! "${GEN[@]}" -t "$t" "$@"; then
    echo "  ✗ codegen failed for '$t' — the SDK is restored as it was" >&2
    restore_all
    exit 1
  fi
done

SLUG="${NEXT_PUBLIC_DB_NAME:-$(sed -n 's/^NEXT_PUBLIC_DB_NAME=//p' .env 2>/dev/null | tr -d '"' | tail -n 1)}"
if [ -n "$SLUG" ]; then
  for t in "${TARGETS[@]}"; do
    if [ -f "$SDK/$t/README.md" ]; then
      SLUG="$SLUG" perl -pi -e 's/\Q$ENV{SLUG}\E/<tenant-slug>/g' "$SDK/$t/README.md"
    fi
  done
fi
