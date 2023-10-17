#!/bin/bash
set -eu -o pipefail

rm -rf .vercel/output
mkdir -p .vercel/output
cp -r dist/vite .vercel/output/static
cp misc/vercel/config.json .vercel/output
