import { objectHas } from "@hiogawa/utils";
import {
  NODE_TYPE_CUSTOM,
  NODE_TYPE_EMPTY,
  NODE_TYPE_FRAGMENT,
  NODE_TYPE_TAG,
  NODE_TYPE_TEXT,
  type NodeKey,
  type VEmpty,
  type VText,
} from "../virtual-dom";

//
// server component (de)serialization
//
//   RNode --(ser)--> SNode --(de)--> VNode    ---(csr)--> BNode
//                          (+ reference map)  \--(ssr)--> string
//

//
// raw node
//

export type RNode = REmpty | RTag | RText | RFragment | RCustom;

export type REmpty = VEmpty;

export type RTag = {
  type: typeof NODE_TYPE_TAG;
  key?: NodeKey;
  name: string; // tagName
  props: Record<string, unknown>;
};

export type RText = VText;

export type RCustom = {
  type: typeof NODE_TYPE_CUSTOM;
  key?: NodeKey;
  props: {};
  render: ((props: {}) => Promise<RNode> | RNode) & { $$id?: string };
};

export type RFragment = {
  type: typeof NODE_TYPE_FRAGMENT;
  key?: NodeKey;
  children: RNode[];
};

export function isRNode(v: unknown): v is RNode {
  return (
    objectHas(v, "type") &&
    (v.type === NODE_TYPE_EMPTY ||
      v.type === NODE_TYPE_TEXT ||
      v.type === NODE_TYPE_TAG ||
      v.type === NODE_TYPE_CUSTOM ||
      v.type === NODE_TYPE_FRAGMENT)
  );
}

export function isSNode(v: unknown): v is SNode {
  return isRNode(v);
}

//
// serialized node
//

export type SNode = SEmpty | STag | SText | SFragment | SReference;

export type SEmpty = VEmpty;

export type STag = {
  type: typeof NODE_TYPE_TAG;
  key?: NodeKey;
  name: string; // tagName
  props: Record<string, unknown>;
};

export type SText = VText;

export type SFragment = {
  type: typeof NODE_TYPE_FRAGMENT;
  key?: NodeKey;
  children: SNode[];
};

export type SReference = {
  type: typeof NODE_TYPE_CUSTOM;
  key?: NodeKey;
  props: {};
  id: string;
};
