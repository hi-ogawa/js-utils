import type {
  NODE_TYPE_CUSTOM,
  NODE_TYPE_FRAGMENT,
  NODE_TYPE_TAG,
  NodeKey,
  VEmpty,
  VText,
} from "../virtual-dom";

//
// server component serialization
//
//   RNode --> SNode --> VNode
//              (+ reference map)
//

export const NODE_TYPE_REFERENCE = "reference" as const;

//
// raw node
//

export type RNode = REmpty | RTag | RText | RFragment | RCustom | SReference;

export type REmpty = VEmpty;

export type RTag = {
  type: typeof NODE_TYPE_TAG;
  key?: NodeKey;
  name: string; // tagName
  props: Record<string, unknown> & {
    children: RComponentChildren;
  };
};

export type RText = VText;

export type RCustom = {
  type: typeof NODE_TYPE_CUSTOM;
  key?: NodeKey;
  props: {};
  render: (props: {}) => Promise<RNode> | RNode;
};

export type RFragment = {
  type: typeof NODE_TYPE_FRAGMENT;
  key?: NodeKey;
  children: RNode[];
};

export type RReference = {
  type: typeof NODE_TYPE_REFERENCE;
  key?: NodeKey;
  props: {};
  id: string;
};

// TODO: generic ComponentChild
export type RComponentChild =
  | RNode
  | string
  | number
  | null
  | undefined
  | boolean;

export type RComponentChildren = RComponentChild | RComponentChildren[];

//
// serialized node
//

export type SNode = SEmpty | STag | SText | SFragment | SReference;

export type SEmpty = VEmpty;

export type STag = {
  type: typeof NODE_TYPE_TAG;
  key?: NodeKey;
  name: string; // tagName
  props: Record<string, unknown> & {
    children?: SNode;
  };
};

export type SText = VText;

export type SFragment = {
  type: typeof NODE_TYPE_FRAGMENT;
  key?: NodeKey;
  children: SNode[];
};

export type SReference = RReference;

export type SComponentChild =
  | SNode
  | string
  | number
  | null
  | undefined
  | boolean;

export type SComponentChildren = SComponentChild | SComponentChildren[];

// //
// // hyperscript
// //

// export function createRNode(): RNode {
// }
