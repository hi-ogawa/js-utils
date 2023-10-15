import type { HookContext } from "./hooks";

//
// host/virtual/bundle node types and helper
//

export type NodeKey = string | number;
export type Props = Record<string, unknown>;

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
export type VText = {
  type: typeof NODE_TYPE_TEXT;
  data: string;
};

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

export type BEmpty = {
  type: typeof NODE_TYPE_EMPTY;
};

export type BTag = Omit<VTag, "child"> & {
  child: BNode;
  hnode: HTag;
  listeners: Map<string, () => void>;
};

export type BText = VText & {
  hnode: HText;
};

export type BCustom = VCustom & {
  parent?: BNodeParent;
  child: BNode;
  slot?: HNode;
  hparent?: HNode;
  hookContext: HookContext;
};

export type BFragment = Omit<VFragment, "children"> & {
  parent?: BNodeParent;
  children: BNode[];
  slot?: HNode;
};

export function emptyNode(): BNode {
  return {
    type: NODE_TYPE_EMPTY,
  } satisfies BEmpty;
}

export const EMPTY_VNODE = null satisfies VEmpty;

export function getNodeKey(node: VNode | BNode): NodeKey | undefined {
  if (node === EMPTY_VNODE) {
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

// "slot" is the last HNode inside the BNode subtree
export function getSlot(node: BNode): HNode | undefined {
  if (node.type === NODE_TYPE_EMPTY) {
    return;
  }
  if (node.type === NODE_TYPE_TAG || node.type === NODE_TYPE_TEXT) {
    return node.hnode;
  }
  return node.slot;
}

// bnode parent traversal is only for BCustom and BFragment
export function getBNodeParent(node: BNode): BNodeParent | undefined {
  if (node.type === NODE_TYPE_CUSTOM || node.type === NODE_TYPE_FRAGMENT) {
    return node.parent;
  }
  return;
}

export function setBNodeParent(node: BNode, parent: BNodeParent) {
  if (node.type === NODE_TYPE_CUSTOM || node.type === NODE_TYPE_FRAGMENT) {
    node.parent = parent;
  }
}
