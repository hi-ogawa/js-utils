# tiny-rpc

Simpler but generalized alternative of `tRPC` and `comlink`.

As `tRPC` alternative:

- no distinction of `query` and `mutation`
- no builtin `context` in favor of letting users impelemnt own logic by [`AsyncLocalStorage`](https://nodejs.org/api/async_context.html)
- no builtin "react-query" integration in favor of making use of general `@hiogawa/query-proxy`

As `comlink` alternative:

- no callback

## todo

- custom (de)serializer

## inspired by

- https://github.com/trpc/trpc
- https://github.com/antfu/birpc
- https://github.com/GoogleChromeLabs/comlink/
- https://github.com/brillout/telefunc
