#!/bin/bash
set -eu -o pipefail

# usage
#   bash misc/generate-tsconfig.sh > tsconfig.json

pnpm ls --filter './packages/**' --depth -1 --json \
  | jq -r --argjson PWD_LEN "${#PWD}" '{ include: [], references: map({ path: .path[$PWD_LEN + 1:] }) }'
