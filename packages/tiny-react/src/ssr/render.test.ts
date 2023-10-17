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
      '"<div class=\\"flex\\" aria-current=\\"\\">hello<span title=\\"foo\\">world</span></div>"'
    );
  });

  it("void-element", () => {
    const vnode = h.div({}, h.input({}), h.span({}), h.br({}));
    expect(renderToString(vnode)).toMatchInlineSnapshot(
      '"<div><input/><span></span><br/></div>"'
    );
  });

  it("escape", () => {
    const vnode = h.div({ title: "a & b" }, "<hehe />", "'\"");
    expect(renderToString(vnode)).toMatchInlineSnapshot(
      '"<div title=\\"a &amp; b\\">&lt;hehe /&gt;&#x27;&quot;</div>"'
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

  it("TODO-attribute-lowercase", () => {
    // not kebab case but lower case
    // cf. https://github.com/preactjs/preact-render-to-string/blob/ba4f4eb1f81e01ac15aef377ae609059e9b2ffce/src/util.js#L4
    const vnode = h.input({
      maxLength: 0,
      readOnly: true,
      inputMode: "numeric",
    });
    expect(renderToString(vnode)).toMatchInlineSnapshot(
      '"<input max-length=\\"0\\" read-only=\\"true\\" input-mode=\\"numeric\\"/>"'
    );
  });

  it("tag-textarea", () => {
    const vnode = h.textarea({ value: "hello" });
    expect(renderToString(vnode)).toMatchInlineSnapshot(
      '"<textarea>hello</textarea>"'
    );
  });

  it("TODO-tag-select", () => {
    // "selected" should be added to option
    const vnode = h.select(
      { value: "a" },
      h.option({ value: "a" }, "x"),
      h.option({ value: "b" }, "y")
    );
    expect(renderToString(vnode)).toMatchInlineSnapshot(
      '"<select value=\\"a\\"><option value=\\"a\\">x</option><option value=\\"b\\">y</option></select>"'
    );
  });
});
