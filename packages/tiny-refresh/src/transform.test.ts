import { describe, expect, it } from "vitest";
import { hmrTransform } from "./transform";

describe(hmrTransform, () => {
  it("basic", () => {
    const input = `\
// @hmr
export default function CompFn() {
  return <div>hello</div>;
}

// @hmr
export let CompLet = () => {
  return <div>hello</div>;
}

// @hmr-unsafe
const CompConst = () => {
  return <div>hello</div>;
}

function CompNooo() {
  return <div>hello</div>;
}
`;
    expect(
      hmrTransform(input, {
        runtime: "react",
        bundler: "vite",
        autoDetect: false,
      })
    ).toMatchInlineSnapshot(`
      "
      import * as $$runtime from \\"react\\";
      import * as $$refresh from \\"@hiogawa/tiny-refresh\\";
      const $$registry = $$refresh.createHmrRegistry({
        createElement: $$runtime.createElement,
        useState: $$runtime.useState,
        useEffect: $$runtime.useEffect,
      }, false);

      // @hmr
      export default function CompFn() {
        return <div>hello</div>;
      }

      // @hmr
      export let CompLet = () => {
        return <div>hello</div>;
      }

      // @hmr-unsafe
      let CompConst = () => {
        return <div>hello</div>;
      }

      function CompNooo() {
        return <div>hello</div>;
      }


      if (typeof CompFn === \\"function\\") {
        var $$tmp_CompFn = CompFn;
        CompFn = $$refresh.createHmrComponent($$registry, \\"CompFn\\", $$tmp_CompFn, { remount: true });
      }


      if (typeof CompLet === \\"function\\") {
        var $$tmp_CompLet = CompLet;
        CompLet = $$refresh.createHmrComponent($$registry, \\"CompLet\\", $$tmp_CompLet, { remount: true });
      }


      if (typeof CompConst === \\"function\\") {
        var $$tmp_CompConst = CompConst;
        CompConst = $$refresh.createHmrComponent($$registry, \\"CompConst\\", $$tmp_CompConst, { remount: false });
      }


      if (import.meta.hot) {
        $$refresh.setupHmrVite(import.meta.hot, $$registry);
        () => import.meta.hot.accept();
      }
      "
    `);
  });

  it("auto-detect", () => {
    const input = `\
export default function CompFn() {
  return <div>hello</div>;
}

export let CompLet = () => {
  return <div>hello</div>;
}

// @hmr-unsafe
const CompConst = () => {
  return <div>hello</div>;
}

function CompFn2() {
  return <div>hello</div>;
}

const lower = 0;
const UPPER = 1;

`;
    expect(
      hmrTransform(input, {
        runtime: "react",
        bundler: "vite",
        autoDetect: true,
      })
    ).toMatchInlineSnapshot(`
      "
      import * as $$runtime from \\"react\\";
      import * as $$refresh from \\"@hiogawa/tiny-refresh\\";
      const $$registry = $$refresh.createHmrRegistry({
        createElement: $$runtime.createElement,
        useState: $$runtime.useState,
        useEffect: $$runtime.useEffect,
      }, false);

      export default function CompFn() {
        return <div>hello</div>;
      }

      export let CompLet = () => {
        return <div>hello</div>;
      }

      // @hmr-unsafe
      let CompConst = () => {
        return <div>hello</div>;
      }

      function CompFn2() {
        return <div>hello</div>;
      }

      const lower = 0;
      let UPPER = 1;



      if (typeof CompFn === \\"function\\") {
        var $$tmp_CompFn = CompFn;
        CompFn = $$refresh.createHmrComponent($$registry, \\"CompFn\\", $$tmp_CompFn, { remount: true });
      }


      if (typeof CompLet === \\"function\\") {
        var $$tmp_CompLet = CompLet;
        CompLet = $$refresh.createHmrComponent($$registry, \\"CompLet\\", $$tmp_CompLet, { remount: true });
      }


      if (typeof CompConst === \\"function\\") {
        var $$tmp_CompConst = CompConst;
        CompConst = $$refresh.createHmrComponent($$registry, \\"CompConst\\", $$tmp_CompConst, { remount: false });
      }


      if (typeof CompFn2 === \\"function\\") {
        var $$tmp_CompFn2 = CompFn2;
        CompFn2 = $$refresh.createHmrComponent($$registry, \\"CompFn2\\", $$tmp_CompFn2, { remount: true });
      }


      if (typeof UPPER === \\"function\\") {
        var $$tmp_UPPER = UPPER;
        UPPER = $$refresh.createHmrComponent($$registry, \\"UPPER\\", $$tmp_UPPER, { remount: true });
      }


      if (import.meta.hot) {
        $$refresh.setupHmrVite(import.meta.hot, $$registry);
        () => import.meta.hot.accept();
      }
      "
    `);
  });
});
