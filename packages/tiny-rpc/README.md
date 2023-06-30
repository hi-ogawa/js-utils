# tiny-rpc

super simplified version of `tRPC`.

- no "context"
  - user code can bring own logic e.g. via `AsyncLocalStorage`
- no "query/mutation" distinction
  - everything is `POST`
- can reuse general `@hiogawa/query-proxy` for "react-query" integration
