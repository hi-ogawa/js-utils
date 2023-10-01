import { type ComponentChildren, type ComponentType, h } from "./hyperscript";
import type { NodeKey, VNode } from "./virtual-dom";

// jsx-runtime convention for type-checker and transpilers
// https://www.typescriptlang.org/tsconfig#jsxImportSource
// https://esbuild.github.io/api/#jsx-import-source
// https://github.com/reactjs/rfcs/blob/createlement-rfc/text/0000-create-element-changes.md#detailed-design
// https://github.com/preactjs/preact/blob/08b07ccea62bfdb44b983bfe69ae73eb5e4f43c7/jsx-runtime/src/index.js

export function jsx(
  tag: ComponentType,
  props: { children?: ComponentChildren },
  key?: NodeKey
) {
  // for now, just delegate to hyperscript without specific optimization
  const { children, ...otherProps } = props;
  return h(tag, { key, ...otherProps }, props.children);
}

export { jsx as jsxs, jsx as jsxDEV };

export { Fragment } from "./hyperscript";

export namespace JSX {
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
  // derive IntrinsicElements based on lib.dom typing
  //

  // refine Event type (e.g. MouseEvent)
  // refine currentTarget
  type PatchedEventHandlers<T> = {
    [K in keyof GlobalEventHandlers]: K extends `on${infer K}`
      ? K extends keyof GlobalEventHandlersEventMap
        ? (
            event: Omit<GlobalEventHandlersEventMap[K], "currentTarget"> & {
              readonly currentTarget: T;
            }
          ) => void
        : never
      : never;
  };

  type ToIntrinsicElementProps<T> = Omit<
    Partial<T>,
    keyof GlobalEventHandlers | keyof ElementChildrenAttribute
  > &
    Partial<PatchedEventHandlers<T>> &
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