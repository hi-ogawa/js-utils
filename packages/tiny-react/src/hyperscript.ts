import { type NodeKey, type Props, type VNode, emptyNode } from "./virtual-dom";

//
// helper to construct VNode
//

// TODO: learn from
// https://github.com/reactjs/rfcs/blob/createlement-rfc/text/0000-create-element-changes.md
// https://www.typescriptlang.org/tsconfig#jsxImportSource
// https://github.com/preactjs/preact/blob/08b07ccea62bfdb44b983bfe69ae73eb5e4f43c7/jsx-runtime/src/index.js

export type ComponentType = string | ((props: any) => VNode);

type ComponentChild = VNode | string | number | null | undefined | boolean;

export function h(
  t: ComponentType,
  inProps: Props,
  ...children: ComponentChild[]
): VNode {
  const child: VNode =
    children.length === 0
      ? emptyNode()
      : {
          type: "fragment",
          children: children.map((c) => normalizeComponentChild(c)),
        };

  const { key, ...props } = inProps as { key?: NodeKey };

  if (typeof t === "string") {
    const { ref, ...tagProps } = props as { ref?: any };
    return {
      type: "tag",
      name: t,
      key,
      ref,
      props: tagProps,
      child,
    };
  } else if (typeof t === "function") {
    return {
      type: "custom",
      key,
      props: {
        ...props,
        children: child,
      },
      render: t,
    };
  }
  return t satisfies never;
}

export function Fragment(props: { children: VNode }): VNode {
  return props.children;
}

function normalizeComponentChild(child: ComponentChild): VNode {
  if (
    child === null ||
    typeof child === "undefined" ||
    typeof child === "boolean"
  ) {
    return {
      type: "empty",
    };
  }
  if (typeof child === "string" || typeof child === "number") {
    return {
      type: "text",
      data: String(child),
    };
  }
  return child;
}
