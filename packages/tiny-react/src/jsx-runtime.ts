import { type ComponentChildren, type ComponentType } from "./hyperscript";
import type { NodeKey } from "./virtual-dom";

// jsx-runtime convention for transpilers
// https://www.typescriptlang.org/tsconfig#jsxImportSource
// https://github.com/reactjs/rfcs/blob/createlement-rfc/text/0000-create-element-changes.md#detailed-design
// https://github.com/preactjs/preact/blob/08b07ccea62bfdb44b983bfe69ae73eb5e4f43c7/jsx-runtime/src/index.js

export function jsx(
  type: ComponentType,
  props: { children?: ComponentChildren },
  key?: NodeKey
) {
  // TODO
  type;
  props;
  key;
}

export { jsx as jsxs, jsx as jsxDEV };

export { Fragment } from "./hyperscript";
