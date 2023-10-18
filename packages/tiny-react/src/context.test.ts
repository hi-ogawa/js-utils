import { describe, expect, it } from "vitest";
import { createContext, useContext } from "./context";
import { Fragment, h } from "./helper/hyperscript";
import { useState } from "./hooks";
import { render } from "./reconciler";
import { sleepFrame } from "./test-utils";

describe(createContext, () => {
  it("basic", () => {
    const context = createContext(-1);

    function Outer() {
      const value = useContext(context);
      return h(
        context.Provider,
        { value: 123 },
        JSON.stringify(value),
        h(Inner, {})
      );
    }

    function Inner() {
      const value = useContext(context);
      return h(
        Fragment,
        {},
        JSON.stringify(value),
        h(context.Provider, { value: value * 2 }, h(Inner2, {}))
      );
    }

    function Inner2() {
      const value = useContext(context);
      return h(Fragment, {}, JSON.stringify(value));
    }

    const vnode = h(Outer, {});
    const parent = document.createElement("main");
    render(vnode, parent);
    expect(parent).toMatchInlineSnapshot(`
      <main>
        -1
        123
        246
      </main>
    `);
  });

  it("change", async () => {
    const context = createContext(0);

    function Outer() {
      const [value, setValue] = useState(100);

      return h(
        context.Provider,
        { value },
        h.button({ onclick: () => setValue((prev) => prev + 1) }, "+1"),
        h(Inner, {})
      );
    }

    function Inner() {
      const value = useContext(context);
      value satisfies number;
      return h(Fragment, {}, value);
    }

    const vnode = h(Outer, {});
    const parent = document.createElement("main");
    render(vnode, parent);
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <button>
          +1
        </button>
        100
      </main>
    `);

    parent.querySelector("button")!.click();
    await sleepFrame();
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <button>
          +1
        </button>
        101
      </main>
    `);
  });

  it("TODO-memo", () => {});
});
