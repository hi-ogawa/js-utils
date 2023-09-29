import * as types from "./dist/jsx-types";

declare global {
  namespace JSX {
    export import Element = types.Element;
    export import ElementChildrenAttribute = types.ElementChildrenAttribute;
    export import IntrinsicAttributes = types.IntrinsicAttributes;
    export import IntrinsicElements = types.IntrinsicElements;
    interface ElementClass {}
    interface ElementAttributesProperty {}
    interface ElementType {}
    interface IntrinsicClassAttributes {}
    interface LibraryManagedAttributes {}
  }
}
