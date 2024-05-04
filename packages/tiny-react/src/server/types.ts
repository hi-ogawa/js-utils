import {
  type UnknownProps,
  type VCustom,
  type VEmpty,
  type VFragment,
  type VTag,
  type VText,
  isVNode,
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
export type RTag = VTag;
export type RText = VText;

export interface RCustom extends Omit<VCustom, "render"> {
  render: ((props: UnknownProps) => Promise<RNode> | RNode) & {
    $$id?: string;
  };
}

export interface RFragment extends Omit<VFragment, "children"> {
  children: RNode[];
}

//
// serialized node
//

export type SNode = SEmpty | STag | SText | SFragment | SCustom;

export type SEmpty = VEmpty;
export type STag = VTag;
export type SText = VText;

export interface SFragment extends Omit<VFragment, "children"> {
  children: SNode[];
}

export interface SCustom extends Omit<VCustom, "render"> {
  $$id: string;
}

export function isRNode(v: unknown): v is RNode {
  return isVNode(v);
}

export function isSNode(v: unknown): v is SNode {
  return isVNode(v);
}

export function registerClientReference(Component: Function, $$id: string) {
  return Object.assign(Component, { $$id });
}
