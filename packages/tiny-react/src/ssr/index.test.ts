import { tinyassert } from "@hiogawa/utils";
import { describe, expect, it, vi } from "vitest";
import { h } from "../helper/hyperscript";
import { hydrate } from "../reconciler";
import { createVNode } from "../virtual-dom";
import { renderToString } from "./render";

describe(hydrate, () => {
  it("basic", () => {
    const vnode = h.div({}, "hello", h.span({}, "world"));
    const vnodeSsr = renderToString(vnode);
    expect(vnodeSsr).toMatchInlineSnapshot(
      '"<div>hello<span>world</span></div>"'
    );

    const parent = document.createElement("main");
    parent.innerHTML = vnodeSsr;
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div>
          hello
          <span>
            world
          </span>
        </div>
      </main>
    `);
    const div = parent.querySelector("div");
    const span = parent.querySelector("span");

    hydrate(vnode, parent);
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div>
          hello
          <span>
            world
          </span>
        </div>
      </main>
    `);

    // check element ideneity is preserved
    expect(parent.querySelector("div")).toBe(div);
    expect(parent.querySelector("span")).toBe(span);
  });

  it("mismatch - tag", () => {
    const parent = document.createElement("main");
    parent.innerHTML = `<span></span>`;
    expect(() => hydrate(h.div({}), parent)).toThrowErrorMatchingInlineSnapshot(
      `[Error: tag hydration mismatch (actual: 'SPAN', expected: 'div')]`
    );
  });

  it("mismatch - text", () => {
    const parent = document.createElement("main");
    parent.innerHTML = `<div><span></span></div>`;
    expect(() =>
      hydrate(h.div({}, "hello"), parent)
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: text hydration mismatch (actual: 'SPAN', expected: '#text')]`
    );
  });

  it("ref", () => {
    const refDiv = vi.fn();
    const refSpan = vi.fn();
    const vnode = h.div(
      { ref: refDiv },
      "hello",
      h.span({ ref: refSpan }, "world")
    );

    const vnodeSsr = renderToString(vnode);
    expect(refDiv.mock.calls).toMatchInlineSnapshot("[]");
    expect(refSpan.mock.calls).toMatchInlineSnapshot("[]");

    const parent = document.createElement("main");
    parent.innerHTML = vnodeSsr;
    hydrate(vnode, parent);
    expect(refDiv.mock.calls).toMatchInlineSnapshot(`
      [
        [
          <div>
            hello
            <span>
              world
            </span>
          </div>,
        ],
      ]
    `);
    expect(refSpan.mock.calls).toMatchInlineSnapshot(`
      [
        [
          <span>
            world
          </span>,
        ],
      ]
    `);
  });

  it("props", () => {
    const clickFn = vi.fn();
    const vnode = h.div(
      { id: "x" },
      "hello",
      h.button({ onclick: () => clickFn("hi") }, "world")
    );

    const vnodeSsr = renderToString(vnode);
    expect(vnodeSsr).toMatchInlineSnapshot(
      `"<div id="x">hello<button>world</button></div>"`
    );

    const parent = document.createElement("main");
    parent.innerHTML = vnodeSsr;
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div
          id="x"
        >
          hello
          <button>
            world
          </button>
        </div>
      </main>
    `);
    const button = parent.querySelector("button");
    tinyassert(button);
    button.click();
    expect(clickFn.mock.calls).toMatchInlineSnapshot("[]");

    hydrate(vnode, parent);
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div
          id="x"
        >
          hello
          <button>
            world
          </button>
        </div>
      </main>
    `);
    button.click();
    expect(clickFn.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "hi",
        ],
      ]
    `);
  });

  it("text empty", () => {
    // https://babeljs.io/repl#?browsers=defaults%2C%20not%20ie%2011%2C%20not%20ie_mob%2011&build=&builtIns=false&corejs=3.21&spec=false&loose=false&code_lz=DwEwlgbgfA3gRHAvsA9OaBuAUKSs4AESq6U2u0AhvAEbFp4ZA&debug=false&forceAllTransforms=false&modules=false&shippedProposals=false&circleciRepo=&evaluate=false&fileSize=false&timeTravel=false&sourceType=module&lineWrap=true&presets=env%2Creact%2Cstage-2&prettier=false&targets=&version=7.23.6&externalPlugins=&assumptions=%7B%7D
    // <div>{""}</div>
    const vnode = createVNode("div", { children: "" });
    const vnodeSsr = renderToString(vnode);
    expect(vnodeSsr).toMatchInlineSnapshot(`"<div></div>"`);

    const parent = document.createElement("main");
    parent.innerHTML = vnodeSsr;
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div />
      </main>
    `);

    hydrate(vnode, parent);
    expect(markTrailingSpace(parent)).toMatchInlineSnapshot(`
      <main>
        <div>
         ∅
        </div>
      </main>
    `);
  });

  it("text whitespace", () => {
    // <div>{" "}</div>
    const vnode = createVNode("div", { children: " " });
    const vnodeSsr = renderToString(vnode);
    expect(vnodeSsr).toMatchInlineSnapshot(`"<div> </div>"`);

    const parent = document.createElement("main");
    parent.innerHTML = vnodeSsr;
    expect(markTrailingSpace(parent)).toMatchInlineSnapshot(`
      <main>
        <div>
          ∅
        </div>
      </main>
    `);

    hydrate(vnode, parent);
    expect(markTrailingSpace(parent)).toMatchInlineSnapshot(`
      <main>
        <div>
          ∅
        </div>
      </main>
    `);
  });

  it("text concat", () => {
    // <div>a{"b"}</div>
    const vnode = createVNode("div", { children: ["a", "b"] });
    const vnodeSsr = renderToString(vnode);
    expect(vnodeSsr).toMatchInlineSnapshot(`"<div>ab</div>"`);

    const parent = document.createElement("main");
    parent.innerHTML = vnodeSsr;
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div>
          ab
        </div>
      </main>
    `);

    hydrate(vnode, parent);
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div>
          a
          b
        </div>
      </main>
    `);
  });
});

// replace trailing whitespace with "∅" so that IDE won't strip it
function markTrailingSpace(value: unknown) {
  return {
    [Symbol.for("∅")]: true,
    value,
  };
}

expect.addSnapshotSerializer({
  test(val: unknown) {
    return typeof val === "object" && !!val && Symbol.for("∅") in val;
  },
  serialize(val, config, indentation, depth, refs, printer) {
    const s = printer(val.value, config, indentation, depth, refs);
    return s.replaceAll(/ $/gm, "∅");
  },
});
