import { describe, expect, it } from "vitest";
import { solveEditDistance } from "./edit-distance";

describe(solveEditDistance, () => {
  it("basic", () => {
    expect(solveEditDistance([..."kitten"], [..."sitting"]))
      .toMatchInlineSnapshot(`
        {
          "cost": 3,
          "path": [
            {
              "cost": 3,
              "i": 6,
              "j": 7,
              "op": 0,
            },
            {
              "cost": 3,
              "i": 5,
              "j": 6,
              "op": 0,
            },
            {
              "cost": 2,
              "i": 4,
              "j": 5,
              "op": 0,
            },
            {
              "cost": 2,
              "i": 3,
              "j": 4,
              "op": 0,
            },
            {
              "cost": 2,
              "i": 2,
              "j": 3,
              "op": 0,
            },
            {
              "cost": 2,
              "i": 1,
              "j": 2,
              "op": 0,
            },
            {
              "cost": 1,
              "i": 0,
              "j": 1,
              "op": 1,
            },
          ],
        }
      `);
  });
});
