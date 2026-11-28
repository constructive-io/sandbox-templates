#!/usr/bin/env bash
# Run codegen only when the generated SDK is missing. The repo commits stub
# sdk/*/index.ts files, so test for generated content (types.ts), not the dir.
# Codegen introspects the live backend endpoints; a checkout with a generated
# SDK in place builds offline.
set -euo pipefail

cd "$(dirname "$0")/.."

for dir in admin auth app; do
	if [ ! -f "src/graphql/sdk/$dir/types.ts" ]; then
		echo "Generated SDK missing at src/graphql/sdk/$dir — running codegen"
		exec ./scripts/codegen.sh
	fi
done
