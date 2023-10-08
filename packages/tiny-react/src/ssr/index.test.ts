import { describe, expect, it, vi } from "vitest";
import { h } from "../helper/hyperscript";
import { hydrate } from "../reconciler";
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
    expect(parent.querySelector("div")).toBe(div);
    expect(parent.querySelector("span")).toBe(span);
  });

  it("mismatch - tag", () => {
    const parent = document.createElement("main");
    parent.innerHTML = `<span></span>`;
    expect(() => hydrate(h.div({}), parent)).toThrowErrorMatchingInlineSnapshot(
      "\"tag hydration mismatch (actual: 'SPAN', expected: 'div')\""
    );
  });

  it("mismatch - text", () => {
    const parent = document.createElement("main");
    parent.innerHTML = `<div><span></span></div>`;
    expect(() =>
      hydrate(h.div({}, "hello"), parent)
    ).toThrowErrorMatchingInlineSnapshot(
      "\"text hydration mismatch (actual: 'SPAN', expected: '#text')\""
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
});
