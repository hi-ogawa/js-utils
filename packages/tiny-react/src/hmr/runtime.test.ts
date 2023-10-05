import { describe, expect, it } from "vitest";
import type { FC } from "../helper/common";
import { h } from "../helper/hyperscript";
import { useEffect, useState } from "../hooks";
import { render } from "../reconciler";
import {
  type HotContext,
  createHmrComponent,
  createHmrRegistry,
  setupHmr,
} from "./runtime";

describe("hmr", () => {
  it("basic", () => {
    let firstOnNewModule!: (newModule: {} | undefined) => void;

    const hot: HotContext = {
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
        h,
        useState,
        useEffect,
      });

      const Child = createHmrComponent(registry, function Child() {
        return h.div({}, "1");
      });
      ChildExport = Child;

      setupHmr(hot, registry);
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
        h,
        useState,
        useEffect,
      });

      const Child = createHmrComponent(registry, function Child() {
        return h.div({}, "2");
      });
      // this export itself doesn't affect original version of export
      Child;

      setupHmr(hot, registry);
    }

    firstOnNewModule({});
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div>
          2
        </div>
      </main>
    `);

    //
    // 3rd version
    //
    {
      const registry = createHmrRegistry({
        h,
        useState,
        useEffect,
      });

      const Child = createHmrComponent(registry, function Child() {
        return h.div({}, "3");
      });
      Child;

      setupHmr(hot, registry);
    }

    firstOnNewModule({});
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div>
          3
        </div>
      </main>
    `);
  });
});
