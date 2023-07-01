# tiny-rpc

extremely simple alternative for `tRPC`.

- no "context"
  - user code can bring own logic by e.g. [`AsyncLocalStorage`](https://nodejs.org/api/async_context.html)
- no "query/mutation" distinction
- use general `@hiogawa/query-proxy` for "react-query" integration

## todo

- support `GET` endpoint?
  - everything is `POST`, which makes it not possible to utilize `GET` based http caching.
- error handling convention?
