import { describe, expect, it } from "vitest";
import {
  type ViteHot,
  createHmrComponent,
  createHmrRegistry,
  setupHmrVite,
} from ".";
import type { FC } from "../helper/common";
import { createElement, h } from "../helper/hyperscript";
import { useEffect, useState } from "../hooks";
import { render } from "../reconciler";
import { sleepFrame } from "../test-utils";

describe(setupHmrVite, () => {
  it("basic", async () => {
    let firstOnNewModule!: (newModule: {} | undefined) => void;

    const hot: ViteHot = {
      accept: (onNewModule) => {
        firstOnNewModule ??= onNewModule;
      },
      invalidate: () => {},
      data: {},
    };

    let ChildExport: FC;

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
          return h.div({}, "1");
        },
        { remount: true }
      );
      ChildExport = Child;

      setupHmrVite(hot, registry);
    }

    function Parent() {
      return h(ChildExport, {});
    }
    let vnode = h(Parent, {});
    const parent = document.createElement("main");
    render(vnode, parent);
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div>
          1
        </div>
      </main>
    `);

    //
    // 2nd version
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
          return h.div({}, "2");
        },
        { remount: true }
      );
      // this export itself doesn't affect original version of export
      Child;

      setupHmrVite(hot, registry);
    }

    firstOnNewModule({});
    await sleepFrame();

    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div>
          1
        </div>
      </main>
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

      const Child = createHmrComponent(
        registry,
        "Child",
        function Child() {
          return h.div({}, "3");
        },
        { remount: true }
      );
      Child;

      setupHmrVite(hot, registry);
    }

    firstOnNewModule({});
    await sleepFrame();

    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div>
          3
        </div>
      </main>
    `);
  });
});
