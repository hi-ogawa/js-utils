import { describe, expect, it } from "vitest";
import { memo } from "./compat";
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
    const renderCount = { Outer: 0, Inner: 0 };

    function Outer() {
      renderCount.Outer++;
      const [value, setValue] = useState(100);
      return h(
        context.Provider,
        { value },
        h.button({ onclick: () => setValue((prev) => prev + 1) }, "+1"),
        `outer: ${value}`,
        h(Inner, {})
      );
    }

    function Inner() {
      renderCount.Inner++;
      const value = useContext(context) satisfies number;
      return h(Fragment, {}, `inner: ${value}`);
    }

    const vnode = h(Outer, {});
    const parent = document.createElement("main");
    render(vnode, parent);
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <button>
          +1
        </button>
        outer: 100
        inner: 100
      </main>
    `);
    expect(renderCount).toMatchInlineSnapshot(`
      {
        "Inner": 1,
        "Outer": 1,
      }
    `);

    parent.querySelector("button")!.click();
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <button>
          +1
        </button>
        outer: 101
        inner: 101
      </main>
    `);
    expect(renderCount).toMatchInlineSnapshot(`
      {
        "Inner": 2,
        "Outer": 2,
      }
    `);

    await sleepFrame();
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <button>
          +1
        </button>
        outer: 101
        inner: 101
      </main>
    `);
    expect(renderCount).toMatchInlineSnapshot(`
      {
        "Inner": 3,
        "Outer": 2,
      }
    `);
  });

  // TODO: not working
  it("memo", async () => {
    const context = createContext(0);
    const renderCount = { Outer: 0, Inner: 0 };

    function Outer() {
      renderCount.Outer++;
      const [value, setValue] = useState(100);
      return h(
        context.Provider,
        { value },
        h.button({ onclick: () => setValue((prev) => prev + 1) }, "+1"),
        `outer: ${value}`,
        h(Inner, {})
      );
    }

    const Inner = memo(function Inner() {
      renderCount.Inner++;
      const value = useContext(context) satisfies number;
      return h(Fragment, {}, `inner: ${value}`);
    });

    const vnode = h(Outer, {});
    const parent = document.createElement("main");
    render(vnode, parent);
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <button>
          +1
        </button>
        outer: 100
        inner: 100
      </main>
    `);
    expect(renderCount).toMatchInlineSnapshot(`
      {
        "Inner": 1,
        "Outer": 1,
      }
    `);

    parent.querySelector("button")!.click();
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <button>
          +1
        </button>
        outer: 101
        inner: 101
      </main>
    `);
    expect(renderCount).toMatchInlineSnapshot(`
      {
        "Inner": 2,
        "Outer": 2,
      }
    `);

    await sleepFrame();
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <button>
          +1
        </button>
        outer: 101
        inner: 101
      </main>
    `);
    expect(renderCount).toMatchInlineSnapshot(`
      {
        "Inner": 3,
        "Outer": 2,
      }
    `);
  });
});
