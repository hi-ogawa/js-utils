import { describe, expect, it } from "vitest";
import { range } from "./lodash";

describe("range", () => {
  it("basics", () => {
    expect(range(3)).toMatchInlineSnapshot(`
      [
        0,
        1,
        2,
      ]
    `);
    expect(range(2, 5)).toMatchInlineSnapshot(`
      [
        2,
        3,
        4,
      ]
    `);
    expect(range(3, 3)).toMatchInlineSnapshot('[]');
  });
});
