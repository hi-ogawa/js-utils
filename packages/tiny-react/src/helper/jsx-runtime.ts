import {
  NODE_TYPE_CUSTOM,
  NODE_TYPE_TAG,
  type NodeKey,
  type VNode,
} from "../virtual-dom";
import type { ComponentChildren, ComponentType } from "./common";
import { Fragment, createElement } from "./hyperscript";
import type { JSX } from "./jsx-namespace";

// jsx-runtime convention for transpilers
// https://www.typescriptlang.org/tsconfig#jsxImportSource
// https://esbuild.github.io/api/#jsx-import-source
// https://github.com/reactjs/rfcs/blob/createlement-rfc/text/0000-create-element-changes.md#detailed-design
// https://github.com/preactjs/preact/blob/08b07ccea62bfdb44b983bfe69ae73eb5e4f43c7/jsx-runtime/src/index.js

export function jsx(
  tag: ComponentType,
  props: { children?: ComponentChildren },
  key?: NodeKey
): VNode {
  // TODO
  // as the main motivation of jsx-runtime, we can similary delay props normalization until render time.
  // we can simply keep "raw" props (except key) on VTag and VCustom
  // then ref/children normalization is done when reconciled to BTag and BCustom.
  const { children, ...propsNoChildren } = props;
  return createElement(tag, { key, ...propsNoChildren }, props.children);
}

export function jsx2(
  tag: ComponentType,
  props: { children?: ComponentChildren },
  key?: NodeKey
): VNode {
  if (typeof tag === "function") {
    return {
      type: NODE_TYPE_CUSTOM,
      key,
      props,
      render: tag,
    };
  } else if (typeof tag === "string") {
    // TODO: VTagLazy
    return {
      type: NODE_TYPE_TAG,
      name: tag,
      key,
      props,
    } as any;
  }
  return tag satisfies never;
}

export { jsx as jsxs, jsx as jsxDEV, Fragment, type JSX };
