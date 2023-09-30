import { type NodeKey, type Props, type VNode, emptyNode } from "./virtual-dom";

//
// helper to construct VNode
//

// TODO: learn from
// https://github.com/reactjs/rfcs/blob/createlement-rfc/text/0000-create-element-changes.md
// https://www.typescriptlang.org/tsconfig#jsxImportSource
// https://github.com/preactjs/preact/blob/08b07ccea62bfdb44b983bfe69ae73eb5e4f43c7/jsx-runtime/src/index.js

export type ComponentType = string | ((props: any) => VNode);

export type ComponentChild =
  | VNode
  | string
  | number
  | null
  | undefined
  | boolean;

export type ComponentChildren = ComponentChild | ComponentChildren[];

export function h(
  tag: ComponentType,
  inProps: Props,
  ...children: ComponentChildren[]
): VNode {
  const { key, ...props } = inProps as { key?: NodeKey };

  const child = normalizeComponentChildren(children);

  if (typeof tag === "string") {
    const { ref, ...tagProps } = props as { ref?: any };
    return {
      type: "tag",
      name: tag,
      key,
      ref,
      props: tagProps,
      child,
    };
  } else if (typeof tag === "function") {
    return {
      type: "custom",
      key,
      props: {
        ...props,
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
    if (children.length === 0) {
      return emptyNode();
    }
    return {
      type: "fragment",
      children: children.map((c) => normalizeComponentChildren(c)),
    };
  }
  return normalizeComponentChild(children);
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
