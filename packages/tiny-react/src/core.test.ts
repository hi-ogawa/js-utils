import { describe, expect, it } from "vitest";
import { Fragment, h, render } from "./core";

describe(render, () => {
  it("host", () => {
    const el = document.createElement("main");
    render(h("div", {}), el);
    expect(el).toMatchInlineSnapshot(`
      <main>
        <div />
      </main>
    `);
  });

  it("custom", () => {
    const el = document.createElement("main");
    function Custom() {
      return h("div", { class: "flex items-center gap-2" });
    }
    render(h(Custom, {}), el);
    expect(el).toMatchInlineSnapshot(`
      <main>
        <div
          class="flex items-center gap-2"
        />
      </main>
    `);
  });

  it("nest", () => {
    const vnode = h("div", { children: [h("p", {}), h("span", {})] });
    const el = document.createElement("main");
    render(vnode, el);
    expect(el).toMatchInlineSnapshot(`
      <main>
        <div>
          <p />
          <span />
        </div>
      </main>
    `);
  });

  it("primitive", () => {
    const vnode = h("div", {
      children: [
        undefined,
        "123",
        true,
        h("span", { children: ["789"] }),
        false,
        456,
        null,
      ],
    });
    const el = document.createElement("main");
    render(vnode, el);
    expect(el).toMatchInlineSnapshot(`
      <main>
        <div>
          123
          <span>
            789
          </span>
          456
        </div>
      </main>
    `);
  });

  it("children", () => {
    const Custom = () => h("span", {});
    const vnode = h("div", {
      children: ["123", h(Custom, {}), "456"],
    });
    const el = document.createElement("main");
    render(vnode, el);
    // TODO: "span" should between "123" and "456"
    expect(el).toMatchInlineSnapshot(`
      <main>
        <div>
          123
          456
          <span />
        </div>
      </main>
    `);
  });

  it("fragment", () => {
    const vnode = h(Fragment, {
      children: [
        "123",
        h(Fragment, { children: ["abc", h("span", { children: ["def"] })] }),
        "456",
      ],
    });
    const el = document.createElement("main");
    render(vnode, el);
    expect(el).toMatchInlineSnapshot(`
      <main>
        123
        456
        abc
        <span>
          def
        </span>
      </main>
    `);
  });
});
