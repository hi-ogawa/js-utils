# tiny-react

Experiment to study react-like virtual-dom rendering implementation.

Internal architecture is inspired by [yew](https://github.com/yewstack/yew) and [preact](https://github.com/preactjs/preact).

## features

- client side rendering
- functional component
- hooks
- jsx-runtime (similar typescript DX as react)
- hmr (with vite plugin)

## unsupported

- defaultValue prop
- dangerouslySetInnerHTML prop
- mutable ref prop
- onChange prop
- portal
- forwardRef
- useLayoutEffect
- ...

## example

See example app in `./examples/basic`

- https://tiny-react-hiro18181.vercel.app

## links

- https://github.com/preactjs/preact
- https://github.com/snabbdom/snabbdom
- https://github.com/yewstack/yew
- https://github.com/DioxusLabs/dioxus
