import { describe, expect, it } from "vitest";
import { useState } from "../hooks";
import { renderToString } from "./render";

describe(renderToString, () => {
  it("basic", () => {
    const vnode = (
      <div className="flex" ariaCurrent="page">
        hello
        <span title="foo">world</span>
      </div>
    );
    expect(renderToString(vnode)).toMatchInlineSnapshot(
      `"<div class="flex" aria-current="page">hello<span title="foo">world</span></div>"`
    );
  });

  it("void-element", () => {
    const vnode = (
      <div>
        <input></input>
        <span></span>
        <br></br>
      </div>
    );
    expect(renderToString(vnode)).toMatchInlineSnapshot(
      '"<div><input/><span></span><br/></div>"'
    );
  });

  it("escape", () => {
    const vnode = (
      <div title="a & b">
        {"<hehe />"}
        {"'\""}
      </div>
    );
    expect(vnode).toMatchInlineSnapshot(`
      {
        "key": undefined,
        "name": "div",
        "props": {
          "children": [
            "<hehe />",
            "'"",
          ],
          "title": "a & b",
        },
        "type": "tag",
      }
    `);
    expect(renderToString(vnode)).toMatchInlineSnapshot(
      `"<div title="a &amp; b">&lt;hehe /&gt;&#x27;&quot;</div>"`
    );
  });

  it("custom", () => {
    function Custom(props: { value: number }) {
      const [state] = useState("init");
      return <span>{JSON.stringify({ prop: props.value, state })}</span>;
    }
    const vnode = (
      <div>
        <Custom value={123} />
      </div>
    );
    expect(renderToString(vnode)).toMatchInlineSnapshot(
      '"<div><span>{&quot;prop&quot;:123,&quot;state&quot;:&quot;init&quot;}</span></div>"'
    );
  });

  it("attributes", () => {
    // not kebab case but lower case
    // cf. https://github.com/preactjs/preact-render-to-string/blob/ba4f4eb1f81e01ac15aef377ae609059e9b2ffce/src/util.js#L4
    const vnode = <input maxLength={0} readOnly inputMode="numeric" />;
    expect(renderToString(vnode)).toMatchInlineSnapshot(
      `"<input maxlength="0" readonly="true" inputmode="numeric"/>"`
    );
  });

  it("tag-textarea", () => {
    const vnode = <textarea value="hello" />;
    expect(renderToString(vnode)).toMatchInlineSnapshot(
      '"<textarea>hello</textarea>"'
    );
  });

  it("tag-select", () => {
    const vnode = (
      <select value="b">
        <option value="a">x</option>
        <option value="b">y</option>
      </select>
    );
    expect(renderToString(vnode)).toMatchInlineSnapshot(
      `"<select><option value="a">x</option><option selected="true" value="b">y</option></select>"`
    );
  });
});
