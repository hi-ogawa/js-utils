import { type ComponentChildren, type ComponentType, h1 } from "./hyperscript";
import type { NodeKey } from "./virtual-dom";

// jsx-runtime convention for transpilers
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
  const { children, ...propsNoChildren } = props;
  return h1(tag as any, { key, ...propsNoChildren }, props.children);
}

export { jsx as jsxs, jsx as jsxDEV };

export { Fragment } from "./hyperscript";

// re-export for type-checker convention
export { type JSX } from "./jsx-namespace";
