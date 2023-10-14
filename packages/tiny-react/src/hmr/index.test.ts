import { describe, expect, it, vi } from "vitest";
import {
  type ViteHot,
  createHmrComponent,
  createHmrRegistry,
  setupHmrVite,
} from ".";
import { createElement, h } from "../helper/hyperscript";
import { useEffect, useState } from "../hooks";
import { render } from "../reconciler";
import { sleepFrame } from "../test-utils";

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
      return h(ChildExport, {});
    }

    const mockFn = vi.fn();

    //
    // 1st version
    //
    {
      const registry = createHmrRegistry({
        createElement,
        useState,
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
          return h.div({}, "1");
        },
        { remount: true }
      );
      ChildExport = Child;

      setupHmrVite(hot, registry);
    }

    const vnode = h(Parent, {});
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
        useState,
        useEffect,
      });

      // this export itself doesn't affect original version of export
      createHmrComponent(
        registry,
        "Child",
        function Child() {
          return h.div({}, "2");
        },
        { remount: true }
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
        useState,
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
          return h.div({}, "3");
        },
        { remount: true }
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
