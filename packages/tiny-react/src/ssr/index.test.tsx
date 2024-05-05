import { tinyassert } from "@hiogawa/utils";
import { describe, expect, it, vi } from "vitest";
import { hydrate } from "../reconciler";
import { renderToString } from "./render";

describe(hydrate, () => {
  it("basic", () => {
    const vnode = (
      <div>
        hello
        <span>world</span>
      </div>
    );
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
    expect(() =>
      hydrate(<div></div>, parent)
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: tag hydration mismatch (actual: 'SPAN', expected: 'div')]`
    );
  });

  it("mismatch - text", () => {
    const parent = document.createElement("main");
    parent.innerHTML = `<div><span></span></div>`;
    expect(() =>
      hydrate(<div>hello</div>, parent)
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: text hydration mismatch (actual: 'SPAN', expected: '#text')]`
    );
  });

  it("ref", () => {
    const refDiv = vi.fn();
    const refSpan = vi.fn();
    const vnode = (
      <div ref={refDiv}>
        hello
        <span ref={refSpan}>world</span>
      </div>
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
    const vnode = (
      <div id="x">
        hello
        <button onclick={() => clickFn("hi")}>world</button>
      </div>
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
    const vnode = <div>{""}</div>;
    expect(vnode).toMatchInlineSnapshot(`
      {
        "key": undefined,
        "name": "div",
        "props": {
          "children": "",
        },
        "type": "tag",
      }
    `);

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
    const vnode = <div> </div>;
    expect(vnode).toMatchInlineSnapshot(`
      {
        "key": undefined,
        "name": "div",
        "props": {
          "children": " ",
        },
        "type": "tag",
      }
    `);

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
    const vnode = <div>a{"b"}</div>;
    expect(vnode).toMatchInlineSnapshot(`
      {
        "key": undefined,
        "name": "div",
        "props": {
          "children": [
            "a",
            "b",
          ],
        },
        "type": "tag",
      }
    `);

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
