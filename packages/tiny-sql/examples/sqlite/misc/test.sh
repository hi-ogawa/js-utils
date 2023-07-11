#!/bin/bash

rm -f dev.sqlite3
pnpm -s migrate init
pnpm -s migrate status
pnpm -s migrate latest
pnpm -s migrate status
npx vitest run
pnpm -s migrate down
pnpm -s migrate up
