# tiny-rpc

super simplified version of `tRPC`.

- no "context"
  - user code can bring own logic e.g. via `AsyncLocalStorage`
- no "query/mutation" distinction
  - everything is `POST`, which makes it not possible to utilize `GET` based http caching.
- use general `@hiogawa/query-proxy` for "react-query" integration

## todo

- support `GET` endpoint?
- error handling convention?
