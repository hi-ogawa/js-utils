#!/bin/bash
set -eu -o pipefail

make docker/clean
make docker/up
make db/create
pnpm -s migrate init
pnpm -s migrate status
pnpm -s migrate latest
pnpm -s migrate status
npx vitest run
pnpm -s migrate down
pnpm -s migrate status
pnpm -s migrate up
make docker/clean
