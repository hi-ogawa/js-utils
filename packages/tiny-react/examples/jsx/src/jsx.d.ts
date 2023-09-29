// TODO: for starter, experiment it here directly instead of `packages/tiny-react/src/jsx.ts`

// import "@hiogawa/tiny-react/jsx";

// type Tmp = import("@hiogawa/tiny-react/dist/jsx");

// interface Tmp2 {
//   Element: import("@hiogawa/tiny-react/dist/jsx").Element,
//   ElementChildrenAttribute: import("@hiogawa/tiny-react/dist/jsx").ElementChildrenAttribute,
// }

// type Tmp = import("@hiogawa/tiny-react/dist/jsx").Element;

// namespace JSX {
//   // can constraint custom component return type
//   // type Element = Tmp.Element;

//   type Element = {};
//   // interface ElementClass {}
//   // interface ElementAttributesProperty {}

//   // export import X = import("@hiogawa/tiny-react/dist/jsx");
//   // type x = import("@hiogawa/tiny-react/dist/jsx").Tmp.ElementChildrenAttribute

//   // type ElementChildrenAttribute = {
//   //   children: {};
//   // }
//   // import ElementAttributesProperty = import("@hiogawa/tiny-react/dist/jsx").ElementAttributesProperty
//   interface ElementChildrenAttribute {
//     children: {};
//   }
//   // interface ElementChildrenAttribute extends import("@hiogawa/tiny-react/dist/jsx").ElementChildrenAttribute {
//   //   // children: {};
//   // }

//   interface IntrinsicAttributes {
//     key?: NodeKey;
//     ref?: unknown;
//   }

//   // TODO: generate from something
//   interface IntrinsicElements {
//     div: HTMLAttributes;
//     span: HTMLAttributes;
//   }

//   //
//   // internal
//   //
//   interface HTMLAttributes extends IntrinsicAttributes {
//     [key: string]: unknown;
//   }
// }

// prettier-ignore
// declare namespace JSX {
//   type Element = import("@hiogawa/tiny-react/dist/jsx").Element;
//   type ElementClass = import("@hiogawa/tiny-react/dist/jsx").ElementClass;
//   type ElementAttributesProperty = import("@hiogawa/tiny-react/dist/jsx").ElementAttributesProperty;
//   type ElementElementChildrenAttribute = import("@hiogawa/tiny-react/dist/jsx").ElementChildrenAttribute;
//   type IntrinsicAttributes = import("@hiogawa/tiny-react/dist/jsx").IntrinsicAttributes;
//   type IntrinsicElements = import("@hiogawa/tiny-react/dist/jsx").IntrinsicElements;
// }
