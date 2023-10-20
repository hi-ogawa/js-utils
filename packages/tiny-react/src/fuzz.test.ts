import { range } from "@hiogawa/utils";
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { createRoot } from "./compat";
import { h } from "./helper/hyperscript";
import { useState } from "./hooks";

describe("fuzz", () => {
  it("shuffle full keys", () => {
    let setValues!: (v: number[]) => void;

    function Outer() {
      const [values, setValuesOuter] = useState<number[]>([]);
      setValues = setValuesOuter;

      return h.div(
        {},
        values.map((value) => h(Inner, { key: value, value }))
      );
    }

    function Inner({ value }: { value: number }) {
      return h.p({}, value);
    }

    const parent = document.createElement("main");
    const root = createRoot(parent);
    root.render(h(Outer, {}));
    expect(parent.textContent).toMatchInlineSnapshot('""');

    let values = range(30);
    setValues(values);
    expect(parent.textContent).toMatchInlineSnapshot(
      '"01234567891011121314151617181920212223242526272829"'
    );

    fc.assert(
      fc.property(
        fc.shuffledSubarray(values, {
          minLength: values.length,
          maxLength: values.length,
        }),
        (values) => {
          setValues(values);
          expect(parent.textContent).toBe(values.join(""));
        }
      )
    );
  });

  it.skip("nested", () => {});

  it.skip("re-render", () => {});
});
