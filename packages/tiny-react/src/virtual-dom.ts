import type { HookContext } from "./hooks";

//
// host/virtual/bundle node types and helper
//

export type NodeKey = string | number;
export type FC<P = {}> = (props: P) => VNode;

// host node
export type HNode = Node;
export type HTag = Element;
export type HText = Text;

// node type (TODO: check perf between string, number, symbol)
export const NODE_TYPE_EMPTY = "empty" as const;
export const NODE_TYPE_TAG = "tag" as const;
export const NODE_TYPE_TEXT = "text" as const;
export const NODE_TYPE_CUSTOM = "custom" as const;
export const NODE_TYPE_FRAGMENT = "fragment" as const;

//
// virtual node (immutable)
//

// TODO: optimize object shape?
export type VNode = VEmpty | VTag | VText | VCustom | VFragment;

export type VEmpty = {
  type: typeof NODE_TYPE_EMPTY;
};

// dom element
export type VTag = {
  type: typeof NODE_TYPE_TAG;
  key?: NodeKey;
  name: string; // tagName
  props: Record<string, unknown> & {
    ref?: (el: HTag | null) => VNode;
    children?: ComponentChildren;
  };
};

export function isReservedTagProp(key: string) {
  return key === "ref" || key === "children";
}

// text node
export type VText = {
  type: typeof NODE_TYPE_TEXT;
  data: string;
};

// user-defined functional component
export type VCustom = {
  type: typeof NODE_TYPE_CUSTOM;
  key?: NodeKey;
  props: {};
  render: (props: {}) => VNode;
};

export type VFragment = {
  type: typeof NODE_TYPE_FRAGMENT;
  key?: NodeKey;
  children: VNode[];
};

//
// bundle node (mutated through reconcilation and works both as input and output)
//

export type BNode = BEmpty | BTag | BText | BCustom | BFragment;

export type BNodeParent = BTag | BCustom | BFragment;

export type BEmpty = VEmpty;

export type BTag = {
  type: typeof NODE_TYPE_TAG;
  vnode: VTag;
  child: BNode;
  hnode: HTag;
  listeners: Map<string, () => void>;
};

export type BText = {
  type: typeof NODE_TYPE_TEXT;
  vnode: VText;
  hnode: HText;
};

export type BCustom = {
  type: typeof NODE_TYPE_CUSTOM;
  vnode: VCustom;
  child: BNode;
  hookContext: HookContext;
  hrange: [HNode, HNode] | null;
  hparent: HNode | null; // null after unmounted so that we can skip already scheduled re-rendering
  parent: BNodeParent | null;
};

export type BFragment = {
  type: typeof NODE_TYPE_FRAGMENT;
  vnode: VFragment;
  children: BNode[];
  hrange: [HNode, HNode] | null;
  parent: BNodeParent | null;
};

//
// helpers
//

// empty node singleton
export const EMPTY_NODE: VEmpty = {
  type: NODE_TYPE_EMPTY,
};

export function getVNodeKey(node: VNode): NodeKey | undefined {
  if (
    node.type === NODE_TYPE_TAG ||
    node.type === NODE_TYPE_CUSTOM ||
    node.type === NODE_TYPE_FRAGMENT
  ) {
    return node.key;
  }
  return;
}

export function getBNodeKey(node: BNode): NodeKey | undefined {
  if (
    node.type === NODE_TYPE_TAG ||
    node.type === NODE_TYPE_CUSTOM ||
    node.type === NODE_TYPE_FRAGMENT
  ) {
    return node.vnode.key;
  }
  return;
}

export function getBNodeRange(node: BNode): [HNode, HNode] | null {
  if (node.type === NODE_TYPE_EMPTY) {
    return null;
  }
  if (node.type === NODE_TYPE_TAG || node.type === NODE_TYPE_TEXT) {
    return [node.hnode, node.hnode];
  }
  return node.hrange;
}

// bnode parent traversal is only for BCustom and BFragment
export function getBNodeParent(node: BNode): BNodeParent | null {
  if (node.type === NODE_TYPE_CUSTOM || node.type === NODE_TYPE_FRAGMENT) {
    return node.parent;
  }
  return null;
}

export function setBNodeParent(node: BNode, parent: BNodeParent) {
  if (node.type === NODE_TYPE_CUSTOM || node.type === NODE_TYPE_FRAGMENT) {
    node.parent = parent;
  }
}

//
// jsx-runtime compatible VNode factory
//

export type ComponentType = string | FC<any>;

export type ComponentChild =
  | VNode
  | string
  | number
  | null
  | undefined
  | boolean;

export type ComponentChildren = ComponentChild | ComponentChildren[];

export function createVNode(
  tag: ComponentType,
  props: {},
  key?: NodeKey
): VNode {
  if (typeof tag === "string") {
    return {
      type: NODE_TYPE_TAG,
      name: tag,
      key,
      props,
    } satisfies VTag;
  }
  if (typeof tag === "function") {
    return {
      type: NODE_TYPE_CUSTOM,
      render: tag,
      key,
      props,
    } satisfies VCustom;
  }
  return tag satisfies never;
}

// traditional virtual node factory with rest arguments
export function createElement(
  tag: ComponentType,
  { key, ...props }: { key?: NodeKey },
  ...restChildren: ComponentChildren[]
): VNode {
  // unwrap single child to skip trivial fragment.
  // this should be "safe" by the assumption that
  // example such as:
  //   h("div", {}, ...["some-varing", "id-list"].map(key => h("input", { key })))
  // should be written without spreading
  //   h("div", {}, ["some-varing", "id-list"].map(key => h("input", { key })))
  // this should be guaranteed when `h` is used via jsx-runtime-based transpilation.
  const children: ComponentChildren =
    restChildren.length <= 1 ? restChildren[0] : restChildren;
  return createVNode(tag, { ...props, children }, key);
}

// we can probably optimize Fragment creation directly as VFragment in `createVNode`
// but for now we wrap as VCustom, which also helps testing the robustness of architecture
export function Fragment(props: { children?: ComponentChildren }): VNode {
  return normalizeComponentChildren(props.children);
}

export function normalizeComponentChildren(
  children?: ComponentChildren
): VNode {
  if (Array.isArray(children)) {
    return {
      type: NODE_TYPE_FRAGMENT,
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
    return EMPTY_NODE;
  }
  if (typeof child === "string" || typeof child === "number") {
    return {
      type: NODE_TYPE_TEXT,
      data: String(child),
    };
  }
  return child;
}
