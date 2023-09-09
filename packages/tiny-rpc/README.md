# tiny-rpc

Simpler but generalized alternative of `tRPC` and `comlink`.

As `tRPC` alternative:

- no distinction of `query` and `mutation`
- no builtin `context` in favor of letting users impelemnt own logic by [`AsyncLocalStorage`](https://nodejs.org/api/async_context.html)
- no builtin "react-query" integration in favor of making use of general `@hiogawa/query-proxy`

As `comlink` alternative:

- no callback

## inspired by

- https://github.com/trpc/trpc
- https://github.com/antfu/birpc
- https://github.com/GoogleChromeLabs/comlink/
- https://github.com/brillout/telefunc

## examples

- https://github.com/hi-ogawa/toy-metronome/tree/ff0a853eb693b583167c86670be06e4cc3b6449c/src/audioworklet
- https://github.com/hi-ogawa/argon2-wasm-bindgen/tree/650cc380689074be3574e3166178d76763f169cd/packages/app/src/argon2
- https://github.com/hi-ogawa/ytsub-v3/tree/c4cf2b220ca317dbbd63cf7d8fa5725c32d5d4f9/app/trpc
- https://github.com/hi-ogawa/youtube-dl-web-v2/tree/f187548ddebbf4aa67a9552b57ccc511b113e6cf/packages/app/src/trpc
