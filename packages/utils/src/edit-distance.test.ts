import { describe, expect, it } from "vitest";
import { solveEditDistance } from "./edit-distance";

describe(solveEditDistance, () => {
  it("replace", () => {
    expect(solveEditDistance([..."abc"], [..."axc"])).toMatchInlineSnapshot(`
      {
        "padded": [
          [
            "a",
            "b",
            "c",
          ],
          [
            "a",
            "x",
            "c",
          ],
        ],
        "path": [
          {
            "delta": 0,
            "i": 1,
            "j": 1,
            "op": 0,
            "total": 0,
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
            "i": 3,
            "j": 3,
            "op": 0,
            "total": 1,
          },
        ],
        "total": 1,
      }
    `);
  });

  it("insert", () => {
    expect(solveEditDistance([..."ac"], [..."abc"])).toMatchInlineSnapshot(`
      {
        "padded": [
          [
            "a",
            undefined,
            "c",
          ],
          [
            "a",
            "b",
            "c",
          ],
        ],
        "path": [
          {
            "delta": 0,
            "i": 1,
            "j": 1,
            "op": 0,
            "total": 0,
          },
          {
            "delta": 1,
            "i": 1,
            "j": 2,
            "op": 1,
            "total": 1,
          },
          {
            "delta": 0,
            "i": 2,
            "j": 3,
            "op": 0,
            "total": 1,
          },
        ],
        "total": 1,
      }
    `);
  });

  it("remove", () => {
    expect(solveEditDistance([..."abc"], [..."ac"])).toMatchInlineSnapshot(`
      {
        "padded": [
          [
            "a",
            "b",
            "c",
          ],
          [
            "a",
            undefined,
            "c",
          ],
        ],
        "path": [
          {
            "delta": 0,
            "i": 1,
            "j": 1,
            "op": 0,
            "total": 0,
          },
          {
            "delta": 1,
            "i": 2,
            "j": 1,
            "op": 2,
            "total": 1,
          },
          {
            "delta": 0,
            "i": 3,
            "j": 2,
            "op": 0,
            "total": 1,
          },
        ],
        "total": 1,
      }
    `);
  });

  it("case", () => {
    expect(solveEditDistance([..."kitten"], [..."sitting"]))
      .toMatchInlineSnapshot(`
        {
          "padded": [
            [
              "k",
              "i",
              "t",
              "t",
              "e",
              "n",
              undefined,
            ],
            [
              "s",
              "i",
              "t",
              "t",
              "i",
              "n",
              "g",
            ],
          ],
          "path": [
            {
              "delta": 1,
              "i": 1,
              "j": 1,
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
              "delta": 0,
              "i": 3,
              "j": 3,
              "op": 0,
              "total": 1,
            },
            {
              "delta": 0,
              "i": 4,
              "j": 4,
              "op": 0,
              "total": 1,
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
              "i": 6,
              "j": 6,
              "op": 0,
              "total": 2,
            },
            {
              "delta": 1,
              "i": 6,
              "j": 7,
              "op": 1,
              "total": 3,
            },
          ],
          "total": 3,
        }
      `);
  });

  it("basic", () => {
    const s1 = "a b c d e f g   i   k l m n".replaceAll(" ", "");
    const s2 = "a b   d e f g h i j k l x n".replaceAll(" ", "");
    expect(solveEditDistance([...s1], [...s2])).toMatchInlineSnapshot(`
      {
        "padded": [
          [
            "a",
            "b",
            "c",
            "d",
            "e",
            "f",
            "g",
            undefined,
            "i",
            undefined,
            "k",
            "l",
            "m",
            "n",
          ],
          [
            "a",
            "b",
            undefined,
            "d",
            "e",
            "f",
            "g",
            "h",
            "i",
            "j",
            "k",
            "l",
            "x",
            "n",
          ],
        ],
        "path": [
          {
            "delta": 0,
            "i": 1,
            "j": 1,
            "op": 0,
            "total": 0,
          },
          {
            "delta": 0,
            "i": 2,
            "j": 2,
            "op": 0,
            "total": 0,
          },
          {
            "delta": 1,
            "i": 3,
            "j": 2,
            "op": 2,
            "total": 1,
          },
          {
            "delta": 0,
            "i": 4,
            "j": 3,
            "op": 0,
            "total": 1,
          },
          {
            "delta": 0,
            "i": 5,
            "j": 4,
            "op": 0,
            "total": 1,
          },
          {
            "delta": 0,
            "i": 6,
            "j": 5,
            "op": 0,
            "total": 1,
          },
          {
            "delta": 0,
            "i": 7,
            "j": 6,
            "op": 0,
            "total": 1,
          },
          {
            "delta": 1,
            "i": 7,
            "j": 7,
            "op": 1,
            "total": 2,
          },
          {
            "delta": 0,
            "i": 8,
            "j": 8,
            "op": 0,
            "total": 2,
          },
          {
            "delta": 1,
            "i": 8,
            "j": 9,
            "op": 1,
            "total": 3,
          },
          {
            "delta": 0,
            "i": 9,
            "j": 10,
            "op": 0,
            "total": 3,
          },
          {
            "delta": 0,
            "i": 10,
            "j": 11,
            "op": 0,
            "total": 3,
          },
          {
            "delta": 1,
            "i": 11,
            "j": 12,
            "op": 0,
            "total": 4,
          },
          {
            "delta": 0,
            "i": 12,
            "j": 13,
            "op": 0,
            "total": 4,
          },
        ],
        "total": 4,
      }
    `);
  });
});
