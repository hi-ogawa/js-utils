// import { h } from "@hiogawa/tiny-react";
// import { JSX } from "@hiogawa/tiny-react/jsx";
// import "@hiogawa/tiny-react/jsx";
import "@hiogawa/tiny-react/jsx";

// type x = JSX.Element;
// declare global {
//   namespace JSX {
//     interface IntrinsicAttributes {
//       key?: string | number;
//       ref?: unknown;
//     }

//     interface IntrinsicElements {
//       div: IntrinsicAttributes;
//       span: IntrinsicAttributes;
//   }
//   }
// }

export function App() {
  <div key={0} />;

  <div key="">
    {0}
    {""}
  </div>;

  // @ts-expect-error error TS2339: Property 'xxx' does not exist on type 'JSX.IntrinsicElements'.
  <xxx />;

  <Custom1 value="" opt={0} />;

  <Custom1 value=""></Custom1>;

  // @ts-expect-error
  <Custom2 />;

  <Custom2>
    {0}
    {1}
  </Custom2>;
}

function Custom1(props: { value: string; opt?: number }) {
  props;
  return {};
  // return h("div", {});
}

function Custom2(props: { children: number[] }) {
  props;
  return {};
  // return h("div", {});
}
