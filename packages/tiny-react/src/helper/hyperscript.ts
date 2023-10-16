import {
  EMPTY_VNODE,
  NODE_TYPE_CUSTOM,
  NODE_TYPE_FRAGMENT,
  NODE_TYPE_TAG,
  NODE_TYPE_TEXT,
  type NodeKey,
  type Props,
  type VNode,
} from "../virtual-dom";
import type {
  ComponentChild,
  ComponentChildren,
  ComponentType,
} from "./common";
import { type JSX } from "./jsx-namespace";

export function createElement(
  tag: ComponentType,
  props: Props,
  ...children: ComponentChildren[]
): VNode {
  const { key, ...propsNoKey } = props as { key?: NodeKey };

  // unwrap single child to skip trivial fragment.
  // this should be "safe" by the assumption that
  // example such as:
  //   createElement("div", {}, ...["some-varing", "id-list"].map(key => h("input", { key })))
  // should be written without spreading
  //   createElement("div", {}, ["some-varing", "id-list"].map(key => h("input", { key })))
  // this should be guaranteed when `h` is used via jsx-runtime-based transpilation.
  const child = normalizeComponentChildren(
    children.length <= 1 ? children[0] : children
  );

  if (typeof tag === "string") {
    const { ref, ...propsNoKeyNoRef } = propsNoKey as { ref?: any };
    return {
      type: NODE_TYPE_TAG,
      name: tag,
      key,
      ref,
      props: propsNoKeyNoRef,
      child,
    };
  } else if (typeof tag === "function") {
    return {
      type: NODE_TYPE_CUSTOM,
      key,
      props: {
        ...propsNoKey,
        children: child,
      },
      render: tag,
    };
  }
  return tag satisfies never;
}

// we can probably optimize Fragment creation directly as { type: "fragment" }
// but for now we wrap as { type: "custom" }, which also helps testing the robustness of architecture
export function Fragment(props: { children?: ComponentChildren }): VNode {
  return normalizeComponentChildren(props.children);
}

function normalizeComponentChildren(children?: ComponentChildren): VNode {
  if (Array.isArray(children)) {
    return {
      type: NODE_TYPE_FRAGMENT,
      children: children.map((c) => normalizeComponentChildren(c)),
    };
  }
  return normalizeComponentChild(children);
}

function normalizeComponentChild(child: ComponentChild): VNode {
  // TODO: instantiating new object for child/children would break shallow equal used for `memo(Component)`
  if (
    child === null ||
    typeof child === "undefined" ||
    typeof child === "boolean"
  ) {
    return EMPTY_VNODE;
  }
  if (typeof child === "string" || typeof child === "number") {
    return {
      type: NODE_TYPE_TEXT,
      data: String(child),
    };
  }
  return child;
}

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
  ...children: ComponentChildren[]
) => VNode;
