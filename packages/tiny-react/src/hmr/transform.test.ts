import { describe, expect, it } from "vitest";
import { hmrTransform } from "./transform";

describe(hmrTransform, () => {
  it("basic", () => {
    const input = `\
/* @hmr SomeComponent */

function SomeComponent() {
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

      /* @hmr SomeComponent */

      function SomeComponent() {
        return <div>hello</div>;
      }


      var _$tmp_SomeComponent  = SomeComponent ;
      SomeComponent  = _$hmr.createHmrComponent(_$registry, _$tmp_SomeComponent );



      if (import.meta.hot) {
        _$hmr.setupHmr(import.meta.hot, _$registry);
        () => import.meta.hot.accept();
      }

      "
    `);
  });
});
