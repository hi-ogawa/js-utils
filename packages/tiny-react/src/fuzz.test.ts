import { range } from "@hiogawa/utils";
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { createRoot } from "./compat";
import { h } from "./helper/hyperscript";
import { useLayoutEffect, useState } from "./hooks";

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

    let values = range(5);
    setValues(values);
    expect(parent.textContent).toMatchInlineSnapshot('"01234"');

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

  it("re-render inner", () => {
    let setValues!: (v: number[]) => void;
    const innerUpdateMap = new Map<number, () => void>();

    function Outer() {
      const [values, setValuesOuter] = useState<number[]>([]);
      setValues = setValuesOuter;

      return h.div(
        {},
        values.map((value) => h(Inner, { key: value, value }))
      );
    }

    function Inner({ value }: { value: number }) {
      const [state, setState] = useState(true);

      useLayoutEffect(() => {
        innerUpdateMap.set(value, () => setState((prev) => !prev));
      }, []);

      return h[state ? "p" : "a"]({}, value);
    }

    const parent = document.createElement("main");
    const root = createRoot(parent);
    root.render(h(Outer, {}));
    expect(parent.textContent).toMatchInlineSnapshot('""');

    let values = range(5);
    setValues(values);
    innerUpdateMap.get(0)!();
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div>
          <a>
            0
          </a>
          <p>
            1
          </p>
          <p>
            2
          </p>
          <p>
            3
          </p>
          <p>
            4
          </p>
        </div>
      </main>
    `);
    expect(parent.textContent).toMatchInlineSnapshot('"01234"');

    fc.assert(
      fc.property(
        fc.shuffledSubarray(values, {
          minLength: values.length,
          maxLength: values.length,
        }),
        fc.integer({ min: 0, max: values.length - 1 }),
        (values, inner) => {
          setValues(values);
          innerUpdateMap.get(inner)!();
          expect(parent.textContent).toBe(values.join(""));
        }
      )
    );
  });

  it.skip("nested", () => {});
});
