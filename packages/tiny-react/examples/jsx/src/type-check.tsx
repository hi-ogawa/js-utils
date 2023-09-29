import { h } from "@hiogawa/tiny-react";

export function _typeCheck() {
  <div />;

  <div key={0} />;

  <div key="">
    {0}
    {""}
  </div>;

  // @ts-expect-error
  <span badAttr={0} />;

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

  // @ts-expect-error JSX.Element enforces custom component return type
  <Custom3 />;
  // @ts-expect-error
  <Custom4 />;
}

function Custom1(props: { value: string; opt?: number }) {
  props;
  return h("div", {});
}

function Custom2(props: { children: number[] }) {
  props;
  return h("div", {});
}

function Custom3() {
  return {};
}

function Custom4() {
  return null;
}
