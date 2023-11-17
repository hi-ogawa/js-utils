import { describe, expect, it } from "vitest";
import { solveEditDistance } from "./edit-distance";

describe(solveEditDistance, () => {
  it("replace", () => {
    expect(solveEditDistance([..."abc"], [..."axc"])).toMatchInlineSnapshot(`
        {
          "path": [
            {
              "delta": 0,
              "i": 3,
              "j": 3,
              "op": 0,
              "total": 1,
            },
            {
              "delta": 1,
              "i": 2,
              "j": 2,
              "op": 0,
              "total": 1,
            },
            {
              "delta": 0,
              "i": 1,
              "j": 1,
              "op": 0,
              "total": 0,
            },
          ],
          "total": 1,
        }
      `);
  });

  it("insert", () => {
    expect(solveEditDistance([..."ac"], [..."abc"])).toMatchInlineSnapshot(`
      {
        "path": [
          {
            "delta": 1,
            "i": 2,
            "j": 3,
            "op": 1,
            "total": 2,
          },
          {
            "delta": 1,
            "i": 2,
            "j": 2,
            "op": 0,
            "total": 1,
          },
          {
            "delta": 0,
            "i": 1,
            "j": 1,
            "op": 0,
            "total": 0,
          },
        ],
        "total": 2,
      }
    `);
  });

  it("remove", () => {
    expect(solveEditDistance([..."abc"], [..."ac"])).toMatchInlineSnapshot(`
      {
        "path": [
          {
            "delta": 1,
            "i": 3,
            "j": 2,
            "op": 2,
            "total": 2,
          },
          {
            "delta": 1,
            "i": 2,
            "j": 2,
            "op": 0,
            "total": 1,
          },
          {
            "delta": 0,
            "i": 1,
            "j": 1,
            "op": 0,
            "total": 0,
          },
        ],
        "total": 2,
      }
    `);
  });

  it("basic", () => {
    expect(solveEditDistance([..."kitten"], [..."sitting"]))
      .toMatchInlineSnapshot(`
        {
          "path": [
            {
              "delta": 1,
              "i": 6,
              "j": 7,
              "op": 1,
              "total": 3,
            },
            {
              "delta": 0,
              "i": 6,
              "j": 6,
              "op": 0,
              "total": 2,
            },
            {
              "delta": 1,
              "i": 5,
              "j": 5,
              "op": 0,
              "total": 2,
            },
            {
              "delta": 0,
              "i": 4,
              "j": 4,
              "op": 0,
              "total": 1,
            },
            {
              "delta": 0,
              "i": 3,
              "j": 3,
              "op": 0,
              "total": 1,
            },
            {
              "delta": 0,
              "i": 2,
              "j": 2,
              "op": 0,
              "total": 1,
            },
            {
              "delta": 1,
              "i": 1,
              "j": 1,
              "op": 0,
              "total": 1,
            },
          ],
          "total": 3,
        }
      `);
  });
});
