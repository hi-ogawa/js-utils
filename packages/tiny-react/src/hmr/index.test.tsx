import { describe, expect, it, vi } from "vitest";
import { type ViteHot, initialize } from ".";
import { useEffect, useReducer } from "../hooks";
import { render } from "../reconciler";
import { sleepFrame } from "../test-utils";
import { createElement } from "../virtual-dom";

describe("hmr", () => {
  it("basic", async () => {
    const acceptCallbacks: ((newModule?: unknown) => void)[] = [];

    const hot: ViteHot = {
      accept: (callback) => {
        acceptCallbacks.push(callback);
      },
      invalidate: () => {},
      data: {},
    };

    let ChildExport: any;

    function Parent() {
      return <ChildExport />;
    }

    const mockFn = vi.fn();

    const runtime = {
      createElement,
      useReducer,
      useEffect,
    };

    //
    // 1st version
    //
    {
      function Child() {
        useEffect(() => {
          mockFn("effect-setup-1");
          return () => {
            mockFn("effect-cleanup-1");
          };
        }, []);
        return <div>1</div>;
      }

      const manager = initialize(hot, runtime, { mode: "vite", debug: false });
      ChildExport = manager.wrap("Child", Child, "useEffect");
      manager.setup();
    }

    const vnode = <Parent />;
    const parent = document.createElement("main");
    render(vnode, parent);
    await sleepFrame();

    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div>
          1
        </div>
      </main>
    `);
    expect(mockFn.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "effect-setup-1",
        ],
      ]
    `);

    //
    // 2nd version
    //
    {
      function Child() {
        return <div>2</div>;
      }

      const manager = initialize(hot, runtime, { mode: "vite", debug: false });
      manager.wrap("Child", Child, "");
      manager.setup();
    }

    // simulate 1st version's `hot.accept`
    acceptCallbacks[0]({});
    await sleepFrame();

    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div>
          2
        </div>
      </main>
    `);
    expect(mockFn.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "effect-setup-1",
        ],
        [
          "effect-cleanup-1",
        ],
      ]
    `);

    //
    // 3rd version
    //
    {
      function Child() {
        useEffect(() => {
          mockFn("effect-setup-3");
          return () => {
            mockFn("effect-cleanup-3");
          };
        }, []);
        return <div>3</div>;
      }

      const manager = initialize(hot, runtime, { mode: "vite", debug: false });
      manager.wrap("Child", Child, "useEffect");
      manager.setup();
    }

    acceptCallbacks[1]({});
    await sleepFrame();

    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div>
          3
        </div>
      </main>
    `);
    expect(mockFn.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "effect-setup-1",
        ],
        [
          "effect-cleanup-1",
        ],
        [
          "effect-setup-3",
        ],
      ]
    `);
  });
});
