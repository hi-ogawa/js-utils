import { describe, expect, it, vi } from "vitest";
import {
  type ViteHot,
  createHmrComponent,
  createHmrRegistry,
  setupHmrVite,
} from ".";
import { useEffect, useReducer } from "../hooks";
import { render } from "../reconciler";
import { sleepFrame } from "../test-utils";
import { createElement } from "../virtual-dom";

describe(setupHmrVite, () => {
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

    //
    // 1st version
    //
    {
      const registry = createHmrRegistry({
        createElement,
        useReducer,
        useEffect,
      });

      const Child = createHmrComponent(
        registry,
        "Child",
        function Child() {
          useEffect(() => {
            mockFn("effect-setup-1");
            return () => {
              mockFn("effect-cleanup-1");
            };
          }, []);
          return <div>1</div>;
        },
        { key: "useEffect" },
        hot
      );
      ChildExport = Child;

      setupHmrVite(hot, registry);
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
    // 2nd version (remount mode allows modifying hooks)
    //
    {
      const registry = createHmrRegistry({
        createElement,
        useReducer,
        useEffect,
      });

      // this export itself doesn't affect original version of export
      createHmrComponent(
        registry,
        "Child",
        function Child() {
          return <div>2</div>;
        },
        { key: "" },
        hot
      );

      setupHmrVite(hot, registry);
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
      const registry = createHmrRegistry({
        createElement,
        useReducer,
        useEffect,
      });

      createHmrComponent(
        registry,
        "Child",
        function Child() {
          useEffect(() => {
            mockFn("effect-setup-3");
            return () => {
              mockFn("effect-cleanup-3");
            };
          }, []);
          return <div>3</div>;
        },
        { key: "useEffect" },
        hot
      );

      setupHmrVite(hot, registry);
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
