#!/bin/bash
set -eu -o pipefail

pnpm ls --filter './packages/**' --depth -1 --json \
  | jq -r --argjson PWD_LEN "${#PWD}" '{ include: [], references: map({ path: .path[$PWD_LEN + 1:] }) }'
