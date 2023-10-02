import type { VNode } from "../virtual-dom";

export type ComponentType = string | ((props: any) => VNode);

export type ComponentChild =
  | VNode
  | string
  | number
  | null
  | undefined
  | boolean;

export type ComponentChildren = ComponentChild | ComponentChildren[];
