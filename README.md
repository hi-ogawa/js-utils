# js-utils

miscellaneous utility packages

```sh
# development
pnpm i
pnpm build
pnpm dev
pnpm test
```

```sh
pnpm ls --filter './packages/**' --depth -1 --json | jq '{ include:[], references: map({ path: .path }) }'
```
