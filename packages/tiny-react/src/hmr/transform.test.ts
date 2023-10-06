import { describe, expect, it } from "vitest";
import { hmrTransform } from "./transform";

describe(hmrTransform, () => {
  it("basic", () => {
    const input = `\
/* @tiny-react.hmr SomeComponent */

function SomeComponent() {
  return <div>hello</div>;
}
`;
    expect(hmrTransform(input)).toMatchInlineSnapshot(`
      "

      import * as _$tinyReact from \\"@hiogawa/tiny-react\\";
      import * as _$tinyReactHmr from \\"@hiogawa/tiny-react/dist/hmr\\";

      const _$registry = _$tinyReactHmr.createHmrRegistry({
        h: _$tinyReact.h,
        useState: _$tinyReact.useState,
        useEffect: _$tinyReact.useEffect,
      });

      /* @tiny-react.hmr SomeComponent */

      function SomeComponent() {
        return <div>hello</div>;
      }


      var _$tmp_SomeComponent  = SomeComponent ;
      SomeComponent  = _$tinyReactHmr.createHmrComponent(_$registry, _$tmp_SomeComponent );



      if (import.meta.hot) {
        _$tinyReactHmr.setupHmr(import.meta.hot, _$registry);
        () => import.meta.hot.accept();
      }

      "
    `);
  });
});
