import type { ComponentType } from "./hyperscript";
import type { NodeKey, VNode } from "./virtual-dom";

// define types via ".ts" so that tsc/tsup catches type-error

// probably nothing is spec'ed so figure it out from checker.ts
// see "namespace JsxNames" at
// https://github.com/microsoft/TypeScript/blob/b0db525798fda109c1c05ef530cb8949ab544677/src/compiler/checker.ts#L50096-L50108

// also learn from
// https://github.com/preactjs/preact/blob/08b07ccea62bfdb44b983bfe69ae73eb5e4f43c7/src/jsx.d.ts
// https://github.com/ryansolid/dom-expressions/blob/a2bd455055f5736bb591abe69a5f5b52568b9ea6/packages/dom-expressions/src/jsx.d.ts
// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/46cd17037ac5399364b0a59511d646c0dd56165a/types/react/index.d.ts#L3249
// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/46cd17037ac5399364b0a59511d646c0dd56165a/types/react/index.d.ts#L3311

// also note
// https://www.typescriptlang.org/tsconfig#jsxFactory
// > If the factory is defined as React.createElement (the default),
// > the compiler will check for React.JSX before checking for a global JSX.
// > If the factory is defined as h, it will check for h.JSX before a global JSX.

// constraint allowed jsx element tag e.g. <Component ... />
export type ElementType = ComponentType;

// type of JSX element e.g. <div /> <Component />
export type Element = VNode;

// not sure what these are for...
export interface ElementClass {}
export interface ElementAttributesProperty {}
export interface IntrinsicClassAttributes {}
export interface LibraryManagedAttributes {}

export interface ElementChildrenAttribute {
  children?: {};
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

type HTMLAttributes = IntrinsicAttributes & ElementChildrenAttribute;
