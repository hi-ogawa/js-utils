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

// TODO: safe to optmize into singleton constant?
export type VEmpty = {
  type: typeof NODE_TYPE_EMPTY;
};

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
  // not needed since only we need to traverse up only from BCustom?
  // but for now, make it easier by having uniform `BNode.parent` type
  parent?: BNodeParent;
};

export type BTag = {
  type: typeof NODE_TYPE_TAG;
  vnode: VTag;
  parent?: BNodeParent;
  child: BNode;
  hnode: HTag;
  listeners: Map<string, () => void>;
};

export type BText = {
  type: typeof NODE_TYPE_TEXT;
  vnode: VText;
  parent?: BNodeParent;
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

export function emptyBNode(): BEmpty {
  return {
    type: NODE_TYPE_EMPTY,
    parent: undefined,
  };
}

// TODO: identical empty vnode?
//       for now, this would be critical to not break `memo(Component)` shallow equal with empty children.
//       ideally, we could VNode to accomodate `null | string | number` primitives...
export const EMPTY_VNODE: VEmpty = {
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

// "slot" is the last HNode inside the BNode subtree
export function getBNodeSlot(node: BNode): HNode | undefined {
  if (node.type === NODE_TYPE_EMPTY) {
    return;
  }
  if (node.type === NODE_TYPE_TAG || node.type === NODE_TYPE_TEXT) {
    return node.hnode;
  }
  return node.slot;
}
