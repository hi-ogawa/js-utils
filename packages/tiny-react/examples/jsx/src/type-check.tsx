import { Fragment } from "@hiogawa/tiny-react";

export function _typeCheck() {
  <div />;

  <div key={0} />;

  <div key="">
    {0}
    {""}
  </div>;

  // @ts-expect-error constraint by JSX.IntrinsicElements["span"]
  <span badAttr={0} />;

  // @ts-expect-error constraint by keyof JSX.IntrinsicElements
  <xxx />;

  <Custom1 value="" opt={0} />;

  <Custom1 value=""></Custom1>;

  <div>
    <span />
    {/* @ts-expect-error constraint by JSX.ElementChildrenAttribute */}
    {{ x: 0 }}
  </div>;

  // @ts-expect-error unexpected children props
  <Custom1 value="">xyz</Custom1>;

  // @ts-expect-error missing children props
  <Custom2 />;

  <Custom2>
    {0}
    {1}
    {{ x: 0 }}
  </Custom2>;

  // @ts-expect-error constraint by JSX.ElementType
  <Custom3 />;
  // @ts-expect-error
  <Custom4 />;

  // fragment
  <>x</>;

  <Fragment>x</Fragment>;

  <Fragment>
    x {0} {[0, 1]}
  </Fragment>;
}

function Custom1(_props: { value: string; opt?: number }) {
  return <div />;
}

function Custom2(_props: { children: (number | { x: number })[] }) {
  return <div />;
}

function Custom3() {
  return {};
}

function Custom4() {
  return null;
}
