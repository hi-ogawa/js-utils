import { describe, expect, it } from "vitest";
import { h } from "../helper/hyperscript";
import { useState } from "../hooks";
import { renderToString } from "./render";

describe(renderToString, () => {
  it("basic", () => {
    const vnode = h.div(
      { className: "flex", ariaCurrent: "" },
      "hello",
      h.span(
        {
          title: "foo",
        },
        "world"
      )
    );
    expect(renderToString(vnode)).toMatchInlineSnapshot(
      '"<div class=\\"flex\\" aria-current=\\"\\">hello <span title=\\"foo\\">world</span></div>"'
    );
  });

  it("void-element", () => {
    const vnode = h.div({}, h.input({}), h.span({}), h.br({}));
    expect(renderToString(vnode)).toMatchInlineSnapshot(
      '"<div><input/> <span></span> <br/></div>"'
    );
  });

  it("escape", () => {
    const vnode = h.div({ title: "a & b" }, "<hehe />", "'\"");
    expect(renderToString(vnode)).toMatchInlineSnapshot(
      '"<div title=\\"a &amp; b\\">&lt;hehe /&gt; &#x27;&quot;</div>"'
    );
  });

  it("custom", () => {
    function Custom(props: { value: number }) {
      const [state] = useState("init");
      return h.span({}, JSON.stringify({ prop: props.value, state }));
    }
    const vnode = h.div({}, h(Custom, { value: 123 }));
    expect(renderToString(vnode)).toMatchInlineSnapshot(
      '"<div><span>{&quot;prop&quot;:123,&quot;state&quot;:&quot;init&quot;}</span></div>"'
    );
  });
});
