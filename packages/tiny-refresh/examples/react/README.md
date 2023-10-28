# tiny-refresh/examples/react

demo app for integration test

```sh
pnpm i
pnpm dev
pnpm test-e2e

# use @hiogawa/tiny-react
# TODO: e2e seems flaky?
REACT_COMPAT=@hiogawa/tiny-react pnpm dev
REACT_COMPAT=@hiogawa/tiny-react pnpm test-e2e
```
