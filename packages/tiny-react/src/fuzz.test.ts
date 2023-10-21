import { range, splitByChunk } from "@hiogawa/utils";
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { createRoot, memo } from "./compat";
import { h } from "./helper/hyperscript";
import { useLayoutEffect, useReducer, useState } from "./hooks";
import { Fragment } from "./virtual-dom";

describe("fuzz", () => {
  it("shuffle full keys", () => {
    let values = range(5);
    let mountCount = 0;
    let outerUpdate!: () => void;

    function Outer() {
      outerUpdate = useForceUpdate();
      return h(
        Fragment,
        {},
        values.map((value) => h(Inner, { key: value, value }))
      );
    }

    function Inner({ value }: { value: number }) {
      useLayoutEffect(() => {
        mountCount++;
      }, []);

      return h.p({}, value);
    }

    const parent = document.createElement("main");
    const root = createRoot(parent);
    root.render(h(Outer, {}));
    expect(parent.textContent).toMatchInlineSnapshot('"01234"');

    fc.assert(
      fc.property(fcShuffle(values), (newValues) => {
        values = newValues;
        outerUpdate();
        expect(parent.textContent).toBe(values.join(""));
      })
    );

    expect(mountCount).toMatchInlineSnapshot("5");
  });

  it("re-render inner", () => {
    let values = range(5);
    let mountCount = 0;
    let outerUpdate!: () => void;
    const innerUpdateMap = new Map<number, () => void>();

    function Outer() {
      outerUpdate = useForceUpdate();
      return h(
        Fragment,
        {},
        values.map((value) => h(Inner, { key: value, value }))
      );
    }

    function Inner({ value }: { value: number }) {
      const [state, setState] = useState(true);
      innerUpdateMap.set(value, () => setState((prev) => !prev));

      useLayoutEffect(() => {
        mountCount++;
      }, []);

      return h[state ? "p" : "a"]({}, value);
    }

    const parent = document.createElement("main");
    const root = createRoot(parent);
    root.render(h(Outer, {}));
    expect(parent.textContent).toMatchInlineSnapshot('"01234"');

    innerUpdateMap.get(0)!();
    expect(parent).toMatchInlineSnapshot(`
      <main>
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
      </main>
    `);
    expect(parent.textContent).toMatchInlineSnapshot('"01234"');

    fc.assert(
      fc.property(
        fcShuffle(values),
        fc.integer({ min: 0, max: values.length - 1 }),
        fc.integer({ min: 0, max: values.length - 1 }),
        (newValues, i1, i2) => {
          values = newValues;
          outerUpdate();
          expect(parent.textContent).toBe(values.join(""));
          innerUpdateMap.get(i1)!();
          expect(parent.textContent).toBe(values.join(""));
          innerUpdateMap.get(i2)!();
          expect(parent.textContent).toBe(values.join(""));
        }
      )
    );

    expect(mountCount).toMatchInlineSnapshot("5");
  });

  it("nested", () => {
    let groups = splitByChunk(range(9), 3);
    let groupIds = groups.map((_, i) => i);
    let outerUpdate!: () => void;
    const innerUpdateMap = new Map<number, () => void>();

    let mountCount = 0;

    function Outer() {
      outerUpdate = useForceUpdate();
      return h(
        Fragment,
        {},
        groupIds.map((groupId) => h(Inner, { key: groupId, groupId }))
      );
    }

    function Inner({ groupId }: { groupId: number }) {
      innerUpdateMap.set(groupId, useForceUpdate());
      useLayoutEffect(() => {
        mountCount++;
      }, []);
      return h(
        Fragment,
        {},
        groups[groupId].map((v) => h.span({ key: v }, v))
      );
    }

    const parent = document.createElement("main");
    const root = createRoot(parent);
    root.render(h(Outer, {}));
    expect(parent.textContent).toMatchInlineSnapshot('"012345678"');

    groups[1].reverse();
    innerUpdateMap.get(1)!();
    expect(parent.textContent).toMatchInlineSnapshot('"012543678"');

    groupIds.reverse();
    outerUpdate();
    expect(parent.textContent).toMatchInlineSnapshot('"678543012"');

    function getExpected() {
      return groupIds.flatMap((id) => groups[id]).join("");
    }

    fc.assert(
      fc.property(
        fcShuffle(groupIds),
        fc.integer({ min: 0, max: groupIds.length - 1 }),
        fc.integer({ min: 0, max: groupIds.length - 1 }),
        (newGroupIds, i1, i2) => {
          groupIds = newGroupIds;
          outerUpdate();
          expect(parent.textContent).toBe(getExpected());

          groups[i1].reverse();
          innerUpdateMap.get(i1)!();
          expect(parent.textContent).toBe(getExpected());

          groups[i2].reverse();
          innerUpdateMap.get(i2)!();
          expect(parent.textContent).toBe(getExpected());
        }
      )
    );

    expect(mountCount).toMatchInlineSnapshot("3");
  });

  it("memo", () => {
    let groups = splitByChunk(range(9), 3);
    let groupIds = groups.map((_, i) => i);
    let outerUpdate!: () => void;
    const innerUpdateMap = new Map<number, () => void>();

    let mountCount = 0;

    function Outer() {
      outerUpdate = useForceUpdate();
      return h(
        Fragment,
        {},
        groupIds.map((groupId) => h(Inner, { key: groupId, groupId }))
      );
    }

    function InnerOriginal({ groupId }: { groupId: number }) {
      innerUpdateMap.set(groupId, useForceUpdate());
      useLayoutEffect(() => {
        mountCount++;
      }, []);
      return h(
        Fragment,
        {},
        groups[groupId].map((v) => h.span({ key: v }, v))
      );
    }
    const Inner = memo(InnerOriginal);

    const parent = document.createElement("main");
    const root = createRoot(parent);
    root.render(h(Outer, {}));
    expect(parent.textContent).toMatchInlineSnapshot('"012345678"');

    groups[1].reverse();
    innerUpdateMap.get(1)!();
    expect(parent.textContent).toMatchInlineSnapshot('"012543678"');

    groupIds.reverse();
    outerUpdate();
    expect(parent.textContent).toMatchInlineSnapshot('"678543012"');

    function getExpected() {
      return groupIds.flatMap((id) => groups[id]).join("");
    }

    fc.assert(
      fc.property(
        fcShuffle(groupIds),
        fc.integer({ min: 0, max: groupIds.length - 1 }),
        fc.integer({ min: 0, max: groupIds.length - 1 }),
        (newGroupIds, i1, i2) => {
          groupIds = newGroupIds;
          outerUpdate();
          expect(parent.textContent).toBe(getExpected());

          groups[i1].reverse();
          innerUpdateMap.get(i1)!();
          expect(parent.textContent).toBe(getExpected());

          groups[i2].reverse();
          innerUpdateMap.get(i2)!();
          expect(parent.textContent).toBe(getExpected());
        }
      )
    );

    expect(mountCount).toMatchInlineSnapshot("3");
  });
});

function fcShuffle<T>(values: T[]) {
  return fc.shuffledSubarray(values, {
    minLength: values.length,
    maxLength: values.length,
  });
}

function useForceUpdate() {
  return useReducer<number, void>((v) => v ^ 1, 0)[1];
}
