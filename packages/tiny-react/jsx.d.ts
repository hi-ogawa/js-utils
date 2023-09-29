import * as types from "./dist/jsx-types";

declare global {
  namespace JSX {
    type ElementType = types.ElementType;
    type Element = types.Element;
    // use "export import" to re-export interface
    export import ElementChildrenAttribute = types.ElementChildrenAttribute;
    export import IntrinsicAttributes = types.IntrinsicAttributes;
    export import IntrinsicElements = types.IntrinsicElements;
    export import ElementClass = types.ElementClass;
    export import ElementAttributesProperty = types.ElementAttributesProperty;
    export import IntrinsicClassAttributes = types.IntrinsicClassAttributes;
    export import LibraryManagedAttributes = types.LibraryManagedAttributes;
  }
}
