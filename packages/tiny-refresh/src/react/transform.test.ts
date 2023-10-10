import { describe, expect, it } from "vitest";
import { hmrTransform } from "./transform";

describe(hmrTransform, () => {
  it("basic", () => {
    const input = `\
// @hmr
function CompFn() {
  return <div>hello</div>;
}

// @hmr
let CompLet = () => {
  return <div>hello</div>;
}

// @hmr
const CompConst = () => {
  return <div>hello</div>;
}

function CompNooo() {
  return <div>hello</div>;
}
`;
    expect(hmrTransform(input, { runtime: "react", bundler: "vite" }))
      .toMatchInlineSnapshot(`
        "
        import * as $$runtime from \\"react\\",
        import * as $$refresh from \\"@hiogawa/tiny-refresh/dist/react/runtime\\";
        const $$registry = $$refresh.createHmrRegistry({
          createElement: $$runtime.createElement,
          useState: $$runtime.useState,
          useEffect: $$runtime.useEffect,
        });

        // @hmr
        function CompFn() {
          return <div>hello</div>;
        }

        // @hmr
        let CompLet = () => {
          return <div>hello</div>;
        }

        // @hmr
        let CompConst = () => {
          return <div>hello</div>;
        }

        function CompNooo() {
          return <div>hello</div>;
        }


        var $$tmp_CompFn = CompFn;
        CompFn = $$refresh.createHmrComponent($$registry, $$tmp_CompFn, { remount: true });


        var $$tmp_CompLet = CompLet;
        CompLet = $$refresh.createHmrComponent($$registry, $$tmp_CompLet, { remount: true });


        var $$tmp_CompConst = CompConst;
        CompConst = $$refresh.createHmrComponent($$registry, $$tmp_CompConst, { remount: true });


        if (import.meta.hot) {
          $$refresh.setupHmrVite(import.meta.hot, $$registry);
          () => import.meta.hot.accept();
        }
        "
      `);
  });
});
