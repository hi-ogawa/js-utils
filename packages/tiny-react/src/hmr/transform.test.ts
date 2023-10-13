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

function CompNa() {
  return <div>hello</div>;
}
`;
    expect(hmrTransform(input)).toMatchInlineSnapshot(`
      "
      import * as $$lib from \\"@hiogawa/tiny-react\\";
      const $$registry = $$lib.createHmrRegistry({
        h: $$lib.h,
        useState: $$lib.useState,
        useEffect: $$lib.useEffect,
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

      function CompNa() {
        return <div>hello</div>;
      }


      var $$tmp_CompFn = CompFn;
      CompFn = $$lib.createHmrComponent($$registry, $$tmp_CompFn, { remount: true });


      var $$tmp_CompLet = CompLet;
      CompLet = $$lib.createHmrComponent($$registry, $$tmp_CompLet, { remount: true });


      var $$tmp_CompConst = CompConst;
      CompConst = $$lib.createHmrComponent($$registry, $$tmp_CompConst, { remount: true });


      if (import.meta.hot) {
        $$lib.setupHmr(import.meta.hot, $$registry);
        () => import.meta.hot.accept();
      }
      "
    `);
  });
});