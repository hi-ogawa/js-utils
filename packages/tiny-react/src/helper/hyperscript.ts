import { type VNode, createElement } from "../virtual-dom";
import type { ComponentChildren } from "./common";
import { type JSX } from "./jsx-namespace";

//
// type-safe createElement wrapper
//

// provide intrinsic tag helper via property access (e.g. h.div(...) instead of h("div", ...))
// since function overloading to support both h("div", ...) and h(Custom, ...)
// seems very clumsy for IDE to deal with.

export const h: Hyperscript = /* @__PURE__ */ new Proxy(() => {}, {
  get(_target, tag, _receiver) {
    return (...args: any[]) => (createElement as any)(tag, ...args);
  },
  apply(_target, _thisArg, args) {
    return (createElement as any)(...args);
  },
}) as any as Hyperscript;

interface Hyperscript extends HyperscriptIntrinsic, HyperscriptCustom {}

type HyperscriptIntrinsic = {
  [K in keyof JSX.IntrinsicElements]: (
    props: JSX.IntrinsicElements[K],
    ...children: ComponentChildren[]
  ) => VNode;
};

type HyperscriptCustom = <P>(
  tag: (props: P) => VNode,
  props: P & JSX.IntrinsicAttributes,
  // TODO: infer `children` types from `P`?
  ...children: ComponentChildren[]
) => VNode;
