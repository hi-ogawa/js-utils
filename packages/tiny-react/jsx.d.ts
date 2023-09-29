// import * as Tmp from "./dist/jsx";
// import { JSX as Tmp } from "./dist/jsx";
import * as types from "./dist/jsx";

declare global {
  namespace JSX {
    export import Element = types.Element;
    export import ElementChildrenAttribute = types.ElementChildrenAttribute;
    export import IntrinsicElements = types.IntrinsicElements;
  }
  namespace JSXx {
    // export import IntrinsicElements = Tmp.IntrinsicElements;

    // interface IntrinsicElements extends Tmp.IntrinsicElements {}

    type Element = {};
    // interface ElementClass {}
    // interface ElementAttributesProperty {}

    // export import X = import("@hiogawa/tiny-react/dist/jsx");
    // type x = import("@hiogawa/tiny-react/dist/jsx").Tmp.ElementChildrenAttribute

    // type ElementChildrenAttribute = {
    //   children: {};
    // }
    // import ElementAttributesProperty = import("@hiogawa/tiny-react/dist/jsx").ElementAttributesProperty
    interface ElementChildrenAttribute {
      children: {};
    }
    // interface ElementChildrenAttribute extends import("@hiogawa/tiny-react/dist/jsx").ElementChildrenAttribute {
    //   // children: {};
    // }

    interface IntrinsicAttributes {
      key?: string | number;
      ref?: unknown;
    }

    interface IntrinsicElements {
      div: HTMLAttributes;
      span: HTMLAttributes;
    }

    //
    // internal
    //
    interface HTMLAttributes extends IntrinsicAttributes {
      [key: string]: unknown;
    }
  }
}

// declare global {
//   namespace JSX {
//     // import IntrinsicElements = Tmp.IntrinsicElements;

//     type Element = {};
//     // interface ElementClass {}
//     // interface ElementAttributesProperty {}

//     // export import X = import("@hiogawa/tiny-react/dist/jsx");
//     // type x = import("@hiogawa/tiny-react/dist/jsx").Tmp.ElementChildrenAttribute

//     // type ElementChildrenAttribute = {
//     //   children: {};
//     // }
//     // import ElementAttributesProperty = import("@hiogawa/tiny-react/dist/jsx").ElementAttributesProperty
//     interface ElementChildrenAttribute {
//       children: {};
//     }
//     // interface ElementChildrenAttribute extends import("@hiogawa/tiny-react/dist/jsx").ElementChildrenAttribute {
//     //   // children: {};
//     // }

//     interface IntrinsicAttributes {
//       key?: string | number;
//       ref?: unknown;
//     }
//   }
// }

// export namespace JSX {
//   export import IntrinsicElements = Tmp.IntrinsicElements;

//   export type Element = {};
//   // interface ElementClass {}
//   // interface ElementAttributesProperty {}

//   // export import X = import("@hiogawa/tiny-react/dist/jsx");
//   // type x = import("@hiogawa/tiny-react/dist/jsx").Tmp.ElementChildrenAttribute

//   // type ElementChildrenAttribute = {
//   //   children: {};
//   // }
//   // import ElementAttributesProperty = import("@hiogawa/tiny-react/dist/jsx").ElementAttributesProperty
//   export interface ElementChildrenAttribute {
//     children: {};
//   }
//   // interface ElementChildrenAttribute extends import("@hiogawa/tiny-react/dist/jsx").ElementChildrenAttribute {
//   //   // children: {};
//   // }

//   export interface IntrinsicAttributes {
//     key?: string | number;
//     ref?: unknown;
//   }
// }
