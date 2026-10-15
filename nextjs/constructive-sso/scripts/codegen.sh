#!/usr/bin/env bash
# codegen.sh — run GraphQL SDK codegen without clobbering hand-written READMEs.
#
# @constructive-io/graphql-codegen unconditionally writes a generated
# "GraphQL SDK" README.md at the project root for multi-target configs
# (generateRootRootReadme has no opt-out). Our README.md is hand-written
# documentation, so preserve it across the run — same for the hand-written
# src/graphql/sdk/README.md inside the generated tree, which the full run's
# directory wipe would otherwise delete.
#
# One full run generates every target in graphql-codegen.config.ts (admin and
# auth — the contexts this app consumes) plus the shared root files
# (sdk/index.ts, sdk/.targets). Targets used to run individually (-t) because
# the generator fatally rejects a schema with no tables ("No tables found
# after filtering") and the old app target was exactly that; the app target is
# gone now, and a template that gains business tables re-adds it in the
# config — every non-empty target survives the full run.
#
# On any failure — an unreachable host, a server error, a wrong slug — the
# whole SDK is restored as it was before the run and the run exits non-zero.
# The restore copy is taken from the tree as it is, not from git, so it also
# works in a project copied from this template without history, and never
# discards an uncommitted regeneration.
#
# Arguments are forwarded to the run (e.g. --dry-run, -v).
#
# The generated READMEs name the endpoint they were generated from, which
# carries the tenant's slug; it is replaced with <tenant-slug> so regenerating
# on a fresh tenant (every bring-up makes one) is not a diff.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

SDK=./src/graphql/sdk
SDK_README="$SDK/README.md"
GEN=(npx @constructive-io/graphql-codegen generate --config ./graphql-codegen.config.ts)

PRESERVE="$(mktemp)"
PRESERVE_SDK="$(mktemp)"
BACKUP="$(mktemp -d)"
cp README.md "$PRESERVE"
[ -f "$SDK_README" ] && cp "$SDK_README" "$PRESERVE_SDK"
cleanup() {
  cp "$PRESERVE" README.md
  [ -f "$PRESERVE_SDK" ] && mkdir -p "$SDK" && cp "$PRESERVE_SDK" "$SDK_README"
  rm -rf "$PRESERVE" "$PRESERVE_SDK" "$BACKUP"
}
trap cleanup EXIT

cp -a "$SDK" "$BACKUP/sdk"

rm -rf "$SDK"
if ! "${GEN[@]}" "$@"; then
  echo "  ✗ codegen failed — the SDK is restored as it was" >&2
  rm -rf "$SDK"
  cp -a "$BACKUP/sdk" "$SDK"
  exit 1
fi
[ -f "$PRESERVE_SDK" ] && cp "$PRESERVE_SDK" "$SDK_README"

SLUG="${NEXT_PUBLIC_DB_NAME:-$(sed -n 's/^NEXT_PUBLIC_DB_NAME=//p' .env 2>/dev/null | tr -d '"' | tail -n 1)}"
if [ -n "$SLUG" ]; then
  find "$SDK" -name README.md -print0 | while IFS= read -r -d '' readme; do
    SLUG="$SLUG" perl -pi -e 's/\Q$ENV{SLUG}\E/<tenant-slug>/g' "$readme"
  done
fi
