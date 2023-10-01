import { type NodeKey, type Props, type VNode } from "./virtual-dom";

//
// helper to construct VNode without JSX
//

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

  // safe to unwrap single child to avoid trivial fragment by the assumption that
  // example such as:
  //   h("div", {}, ...["some-varing", "id-list"].map(key => h("input", { key })))
  // should be written without spreading
  //   h("div", {}, ["some-varing", "id-list"].map(key => h("input", { key })))
  // note that this is guaranteed when `h` is used via jsx-runtime-based transpilation.
  const child = normalizeComponentChildren(
    children.length <= 1 ? children[0] : children
  );

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
