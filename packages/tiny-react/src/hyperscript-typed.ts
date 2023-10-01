import { type ComponentChildren, h1 } from "./hyperscript";
import { type JSX } from "./jsx-namespace";
import type { VNode } from "./virtual-dom";

// provide similar type-safety as typescript JSX

export const h: Hyperscript = /* @__PURE__ */ new Proxy(() => {}, {
  get(_target, tag, _receiver) {
    return (...args: any[]) => (h1 as any)(tag, ...args);
  },
  apply(_target, _thisArg, args) {
    return (h1 as any)(...args);
  },
}) as any as Hyperscript;

// avoid tricky overloading by separating intrinsic tag helper as a property
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
  ...children: ComponentChildren[]
) => VNode;
