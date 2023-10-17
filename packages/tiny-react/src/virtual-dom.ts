import type { HookContext } from "./hooks";

//
// host/virtual/bundle node types and helper
//

export type NodeKey = string | number;
export type Props = Record<string, unknown>;
export type FC<P = any> = (props: P) => VNode;

// host node
export type HNode = Node;
export type HTag = Element;
export type HText = Text;

// node type (TODO: check perf between string, number, symbol)
export const NODE_TYPE_TAG = 0 as const;
export const NODE_TYPE_TEXT = 1 as const;
export const NODE_TYPE_CUSTOM = 2 as const;
export const NODE_TYPE_FRAGMENT = 3 as const;

//
// virtual node (immutable)
//

// TODO: optimize object shape?
export type VNode = VEmpty | VTag | VText | VCustom | VFragment;

export type VEmpty = null;

// dom element
export type VTag = {
  type: typeof NODE_TYPE_TAG;
  key?: NodeKey;
  name: string; // tagName
  props: Props;
  child: VNode;
  ref?: (el: HTag | null) => VNode; // core only supports callback. maybe { current: T } can be implemented in compat layer.
};

// text node
export type VText = string;

// user-defined functional component
export type VCustom = {
  type: typeof NODE_TYPE_CUSTOM;
  key?: NodeKey;
  props: Props;
  render: (props: Props) => VNode;
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

export type BEmpty = null;

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
  parent?: BNodeParent;
  child: BNode;
  slot?: HNode;
  hparent?: HNode; // undefined after unmounted (this flag seems necessary to skip already scheduled re-rendering after unmount)
  hookContext: HookContext;
};

export type BFragment = {
  type: typeof NODE_TYPE_FRAGMENT;
  vnode: VFragment;
  parent?: BNodeParent;
  children: BNode[];
  slot?: HNode;
};

export const EMPTY_NODE = null satisfies VEmpty;

export function isEmptyNode(node: VNode | BNode): node is VEmpty {
  return node === null;
}

export function isVText(node: VNode): node is VText {
  return typeof node === "string";
}

export function getVNodeKey(node: VNode): NodeKey | undefined {
  if (isEmptyNode(node) || isVText(node)) {
    return;
  }
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
  if (node === EMPTY_NODE) {
    return;
  }
  if (
    node.type === NODE_TYPE_TAG ||
    node.type === NODE_TYPE_CUSTOM ||
    node.type === NODE_TYPE_FRAGMENT
  ) {
    return node.vnode.key;
  }
  return;
}

// "slot" is the last HNode inside the BNode subtree
export function getBNodeSlot(node: BNode): HNode | undefined {
  if (node === EMPTY_NODE) {
    return;
  }
  if (node.type === NODE_TYPE_TAG || node.type === NODE_TYPE_TEXT) {
    return node.hnode;
  }
  return node.slot;
}

// bnode parent traversal is only for BCustom and BFragment
export function getBNodeParent(node: BNode): BNodeParent | undefined {
  if (node === EMPTY_NODE) {
    return;
  }
  if (node.type === NODE_TYPE_CUSTOM || node.type === NODE_TYPE_FRAGMENT) {
    return node.parent;
  }
  return;
}

export function setBNodeParent(node: BNode, parent: BNodeParent) {
  if (node === EMPTY_NODE) {
    return;
  }
  if (node.type === NODE_TYPE_CUSTOM || node.type === NODE_TYPE_FRAGMENT) {
    node.parent = parent;
  }
}
