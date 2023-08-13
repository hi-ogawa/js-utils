import { describe, expect, it } from "vitest";
import { memoize } from "./default-map";

describe(memoize, () => {
  it("basic", () => {
    // from https://lodash.com/docs/4.17.15#memoize

    const object = { a: 1, b: 2 };
    const other = { c: 3, d: 4 };

    const f = memoize(Object.values);
    expect(f(object)).toMatchInlineSnapshot(`
      [
        1,
        2,
      ]
    `);
    expect(f(other)).toMatchInlineSnapshot(`
      [
        3,
        4,
      ]
    `);

    object.a = 2;
    expect(f(object)).toMatchInlineSnapshot(`
      [
        1,
        2,
      ]
    `);
  });
});
