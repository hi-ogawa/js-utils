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

// node type (use symbol for debuggability?)
// TODO: perf between string, number, symbol
export const NODE_TYPE_EMPTY = Symbol.for("empty");
export const NODE_TYPE_TAG = Symbol.for("tag");
export const NODE_TYPE_TEXT = Symbol.for("text");
export const NODE_TYPE_CUSTOM = Symbol.for("custom");
export const NODE_TYPE_FRAGMENT = Symbol.for("fragment");

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

export type BEmpty = VEmpty & {
  // not needed since only we need to traverse up only from BCustom?
  // but for now, make it easier by having uniform `BNode.parent` type
  parent?: BNodeParent;
};

export type BTag = Omit<VTag, "child"> & {
  parent?: BNodeParent;
  child: BNode;
  hnode: HTag;
  listeners: Map<string, () => void>;
};

export type BText = VText & {
  parent?: BNodeParent;
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

export function emptyNode(): VNode & BNode {
  return {
    type: NODE_TYPE_EMPTY,
  };
}

// TODO: identical empty vnode?
//       for now, this would be critical to not break `memo(Component)` shallow equal with empty children.
//       ideally, we could VNode to accomodate `null | string | number` primitives...
export const EMPTY_VNODE: VEmpty = {
  type: NODE_TYPE_EMPTY,
};

export function getNodeKey(node: VNode | BNode): NodeKey | undefined {
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
