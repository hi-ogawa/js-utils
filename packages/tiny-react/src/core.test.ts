import { describe, expect, it } from "vitest";
import { h, render } from "./core";

describe(render, () => {
  it("host", async () => {
    const el = document.createElement("main");
    render(h("div", {}), el);
    expect(el).toMatchInlineSnapshot(`
      <main>
        <div />
      </main>
    `);
  });

  it("custom", async () => {
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

  it("nest", async () => {
    const el = document.createElement("main");
    function Custom() {
      return h("div", { children: [h("p", {}), h("span", {})] });
    }
    render(h(Custom, {}), el);
    expect(el).toMatchInlineSnapshot(`
      <main>
        <div>
          <p />
          <span />
        </div>
      </main>
    `);
  });

  it("text", async () => {
    const el = document.createElement("main");
    function Custom() {
      return h("div", {
        children: [
          undefined,
          "123",
          true,
          456,
          false,
          h("span", { children: ["789"] }),
          null,
        ],
      });
    }
    render(h(Custom, {}), el);
    expect(el).toMatchInlineSnapshot(`
      <main>
        <div>
          123
          456
          <span>
            789
          </span>
        </div>
      </main>
    `);
  });
});
