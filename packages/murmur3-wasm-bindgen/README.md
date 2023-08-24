# murmur3-wasm-bindgen

[wasm-bindgen](https://github.com/rustwasm/wasm-bindgen) wrapper for [`stusmall/murmur3`](https://github.com/stusmall/murmur3).

This is only used to fuzz test against js implementation in `packages/utils/src/hash.ts`.

We could move this package to a separate repository to reduce build time and remove rust/wasm-pack dependency.

```sh
pnpm build
pnpm test
pnpm release
```
