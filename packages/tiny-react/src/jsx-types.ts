import type { NodeKey, VNode } from "./virtual-dom";

// probably nothing is spec'ed so figure it out from checker.ts
// see "namespace JsxNames" at
// https://github.com/microsoft/TypeScript/blob/b0db525798fda109c1c05ef530cb8949ab544677/src/compiler/checker.ts#L50096-L50108

// also learn from
// https://github.com/preactjs/preact/blob/08b07ccea62bfdb44b983bfe69ae73eb5e4f43c7/src/jsx.d.ts
// https://github.com/ryansolid/dom-expressions/blob/a2bd455055f5736bb591abe69a5f5b52568b9ea6/packages/dom-expressions/src/jsx.d.ts
// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/46cd17037ac5399364b0a59511d646c0dd56165a/types/react/index.d.ts#L3249
// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/46cd17037ac5399364b0a59511d646c0dd56165a/types/react/index.d.ts#L3311

// constraint functional component return type
export type Element = VNode;

export interface ElementChildrenAttribute {
  children: {};
}

export interface IntrinsicAttributes {
  key?: NodeKey;
  ref?: unknown;
}

// TODO: auto generate
export interface IntrinsicElements {
  div: HTMLAttributes;
  span: HTMLAttributes;
}

interface HTMLAttributes extends IntrinsicAttributes {
  [key: string]: unknown;
}
