import type { NodeKey, VNode } from "../virtual-dom";
import type { ComponentChildren, ComponentType } from "./common";

// JSX namespace convention for type-checker

// probably nothing is spec'ed so figure it out from checker.ts and other library usages
// see "namespace JsxNames" at
// https://github.com/microsoft/TypeScript/blob/b0db525798fda109c1c05ef530cb8949ab544677/src/compiler/checker.ts#L50096-L50108

// learn from
// https://github.com/preactjs/preact/blob/08b07ccea62bfdb44b983bfe69ae73eb5e4f43c7/src/jsx.d.ts
// https://github.com/ryansolid/dom-expressions/blob/a2bd455055f5736bb591abe69a5f5b52568b9ea6/packages/dom-expressions/src/jsx.d.ts
// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/46cd17037ac5399364b0a59511d646c0dd56165a/types/react/index.d.ts#L3249
// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/46cd17037ac5399364b0a59511d646c0dd56165a/types/react/index.d.ts#L3311

// note
// https://www.typescriptlang.org/tsconfig#jsxFactory
// > If the factory is defined as React.createElement (the default),
// > the compiler will check for React.JSX before checking for a global JSX.
// > If the factory is defined as h, it will check for h.JSX before a global JSX.

// see following example for how each type/interface affects jsx typing
// packages/tiny-react/examples/jsx/src/type-check.tsx

export namespace JSX {
  // constraint what's usable as jsx element tag e.g. <div /> <Component ... />
  // `keyof IntrinsicElements` further constraints intrinsic tags
  export type ElementType = ComponentType;

  // type of JSX element e.g. <div /> <Component />
  export type Element = VNode;

  // not sure what these are for...
  export interface ElementClass {}
  export interface ElementAttributesProperty {}
  export interface IntrinsicClassAttributes {}
  export interface LibraryManagedAttributes {}

  export interface ElementChildrenAttribute {
    children?: ComponentChildren;
  }

  export interface IntrinsicAttributes {
    key?: NodeKey;
  }

  export interface IntrinsicElements extends HTMLElementTagNameToProps {}

  //
  // derive IntrinsicElements from lib.dom typing
  // - HTMLElementTagNameMap
  // - GlobalEventHandlersEventMap
  //
  // TODO: probably these typescript wizardly are too expensive for tsc,
  //       so it's better to auto-generate into flat interface...
  //

  // refine currentTarget
  type PatchedEventHandlers<T> = {
    [K in keyof GlobalEventHandlersEventMap as `on${K}`]+?: (
      event: Omit<GlobalEventHandlersEventMap[K], "currentTarget"> & {
        readonly currentTarget: T;
      }
    ) => void;
  };

  // fix up a few more things
  interface PatchProps {
    // for starter, support only simple string instead of CSSStyleDeclaration object
    style?: string;
  }

  type ToIntrinsicElementProps<T> = Omit<
    Partial<T>,
    | keyof GlobalEventHandlers
    | keyof PatchProps
    | keyof ElementChildrenAttribute
  > &
    PatchedEventHandlers<T> &
    PatchProps &
    IntrinsicAttributes &
    ElementChildrenAttribute & {
      ref?: (el: T | null) => void;
    };

  type HTMLElementTagNameToProps = {
    [T in keyof HTMLElementTagNameMap]: ToIntrinsicElementProps<
      HTMLElementTagNameMap[T]
    >;
  };
}
