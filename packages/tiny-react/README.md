# tiny-react

Experiment to study react-like virtual-dom rendering implementation.

Internal architecture is inspired by [yew](https://github.com/yewstack/yew) and [preact](https://github.com/preactjs/preact).

## features

- client side rendering
- functional component
- hooks
- jsx-runtime (similar typescript DX as react)
- HMR (via [`tiny-refresh`](https://github.com/hi-ogawa/js-utils/blob/a93f919c083c3ab0f505f1179124397c8f8f1b0d/packages/tiny-refresh/README.md))

## unsupported

- ssr https://github.com/hi-ogawa/js-utils/pull/150
- context https://github.com/hi-ogawa/js-utils/pull/151
- suspense
- error boundary
- forwardRef
- dangerouslySetInnerHTML
- mutable ref
- defaultValue
- onChange
- svg
- ...

## example

See example app in `./examples/basic`

- https://tiny-react-hiro18181.vercel.app

## links

- https://github.com/preactjs/preact
- https://github.com/snabbdom/snabbdom
- https://github.com/yewstack/yew
- https://github.com/DioxusLabs/dioxus
