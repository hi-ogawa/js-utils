import { Fragment, createVNode } from "../virtual-dom";
import type { JSX } from "./jsx-namespace";

// jsx-runtime convention for transpilers
// https://www.typescriptlang.org/tsconfig#jsxImportSource
// https://esbuild.github.io/api/#jsx-import-source
// https://github.com/reactjs/rfcs/blob/createlement-rfc/text/0000-create-element-changes.md#detailed-design
// https://github.com/preactjs/preact/blob/08b07ccea62bfdb44b983bfe69ae73eb5e4f43c7/jsx-runtime/src/index.js

export {
  createVNode as jsx,
  createVNode as jsxs,
  createVNode as jsxDEV,
  Fragment,
  type JSX,
};
