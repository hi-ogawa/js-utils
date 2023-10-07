import { describe, expect, it } from "vitest";
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
  });
});
