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
      import * as _$lib from \\"@hiogawa/tiny-react\\";
      import * as _$hmr from \\"@hiogawa/tiny-react/dist/hmr\\";
      const _$registry = _$hmr.createHmrRegistry({
        h: _$lib.h,
        useState: _$lib.useState,
        useEffect: _$lib.useEffect,
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

      var _$tmp_CompFn = CompFn;
      CompFn = _$hmr.createHmrComponent(_$registry, _$tmp_CompFn);


      var _$tmp_CompLet = CompLet;
      CompLet = _$hmr.createHmrComponent(_$registry, _$tmp_CompLet);


      var _$tmp_CompConst = CompConst;
      CompConst = _$hmr.createHmrComponent(_$registry, _$tmp_CompConst);

      if (import.meta.hot) {
        _$hmr.setupHmr(import.meta.hot, _$registry);
        () => import.meta.hot.accept();
      }
      "
    `);
  });
});
