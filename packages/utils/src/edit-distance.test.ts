import { describe, expect, it } from "vitest";
import { EDIT_OP, solveEditDistance } from "./edit-distance";

function testDiffString(x: string, y: string) {
  const xs = [...x];
  const ys = [...y];
  const { total, steps } = solveEditDistance(xs, ys);

  // format diff
  const lines = ["", "", ""];
  for (const step of steps) {
    let { i, j, delta, op } = step;
    i -= 1;
    j -= 1;
    if (op === EDIT_OP.replace) {
      lines[0] += xs[i];
      lines[1] += ys[j];
    } else if (op === EDIT_OP.insert) {
      lines[0] += " ";
      lines[1] += ys[j];
    } else if (op === EDIT_OP.remove) {
      lines[0] += xs[i];
      lines[1] += " ";
    }
    lines[2] += delta > 0 ? String(delta) : " ";
  }
  const diff = "\n" + lines.map((l) => l.trim() + "\n").join("");

  return { total, steps, diff };
}

describe(solveEditDistance, () => {
  it("replace", () => {
    expect(testDiffString("abc", "axc")).toMatchInlineSnapshot(`
      {
        "diff": "
      abc
      axc
      1
      ",
        "steps": [
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
    expect(testDiffString("ac", "abc")).toMatchInlineSnapshot(`
      {
        "diff": "
      a c
      abc
      1
      ",
        "steps": [
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
    expect(testDiffString("abc", "ac")).toMatchInlineSnapshot(`
      {
        "diff": "
      abc
      a c
      1
      ",
        "steps": [
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
    expect(testDiffString("kitten", "sitting")).toMatchInlineSnapshot(`
      {
        "diff": "
      kitten
      sitting
      1   1 1
      ",
        "steps": [
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
    expect(testDiffString(s1, s2)).toMatchInlineSnapshot(`
      {
        "diff": "
      abcdefg i klmn
      ab defghijklxn
      1    1 1  1
      ",
        "steps": [
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
