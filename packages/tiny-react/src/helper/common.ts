import type { VNode } from "../virtual-dom";

export type FC = (props: any) => VNode;
export type ComponentType = string | FC;

export type ComponentChild =
  | VNode
  | string
  | number
  | null
  | undefined
  | boolean;

export type ComponentChildren = ComponentChild | ComponentChildren[];
