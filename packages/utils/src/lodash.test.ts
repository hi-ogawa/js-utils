import { describe, expect, it } from "vitest";
import {
  capitalize,
  difference,
  groupBy,
  isNil,
  isNotNil,
  mapGroupBy,
  mapKeys,
  mapValues,
  objectKeys,
  objectOmit,
  objectOmitBy,
  objectPick,
  objectPickBy,
  once,
  partition,
  pickBy,
  range,
  sortBy,
  uniqBy,
  zip,
} from "./lodash";

describe("range", () => {
  it("basic", () => {
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
    expect(range(3, 3)).toMatchInlineSnapshot("[]");
  });
});

describe("groupBy", () => {
  it("basic", () => {
    expect(groupBy(range(8), (x) => x % 3)).toMatchInlineSnapshot(`
      Map {
        0 => [
          0,
          3,
          6,
        ],
        1 => [
          1,
          4,
          7,
        ],
        2 => [
          2,
          5,
        ],
      }
    `);
  });
});

describe("mapKeys", () => {
  it("basic", () => {
    const result = mapKeys(
      groupBy(range(8), (x) => x % 3),
      (_v, k) => k + 10
    );
    expect(result).toMatchInlineSnapshot(`
      Map {
        10 => [
          0,
          3,
          6,
        ],
        11 => [
          1,
          4,
          7,
        ],
        12 => [
          2,
          5,
        ],
      }
    `);
  });
});

describe("mapValues", () => {
  it("basic", () => {
    const result = mapValues(
      groupBy(range(8), (x) => x % 3),
      (v) => v.length
    );
    expect(result).toMatchInlineSnapshot(`
      Map {
        0 => 3,
        1 => 3,
        2 => 2,
      }
    `);
  });
});

describe(mapGroupBy.name, () => {
  it("basic", () => {
    expect(
      mapGroupBy(
        range(8),
        (x) => x % 3,
        (xs) => xs.length
      )
    ).toMatchInlineSnapshot(`
      Map {
        0 => 3,
        1 => 3,
        2 => 2,
      }
    `);
  });
});

describe("pickBy", () => {
  it("basic", () => {
    const result = pickBy(
      groupBy(range(8), (x) => x % 3),
      (_v, k) => k % 2 === 0
    );
    expect(result).toMatchInlineSnapshot(`
      Map {
        0 => [
          0,
          3,
          6,
        ],
        2 => [
          2,
          5,
        ],
      }
    `);
  });
});

describe("partition", () => {
  it("basic", () => {
    expect(partition(range(8), (x) => x % 3 === 0)).toMatchInlineSnapshot(`
      [
        [
          0,
          3,
          6,
        ],
        [
          1,
          2,
          4,
          5,
          7,
        ],
      ]
    `);
  });
});

describe("sortBy", () => {
  it("basic", () => {
    expect(
      sortBy(
        range(8),
        (x) => x % 3,
        (x) => -x
      )
    ).toMatchInlineSnapshot(`
      [
        6,
        3,
        0,
        7,
        4,
        1,
        5,
        2,
      ]
    `);
  });
});

describe("uniqBy", () => {
  it("basic", () => {
    expect(uniqBy(range(8), (x) => x % 3)).toMatchInlineSnapshot(`
      [
        0,
        1,
        2,
      ]
    `);
  });
});

describe("objectPick", () => {
  it("basic", () => {
    const o = {
      x: 0,
      y: 1,
    } as const;
    const result = objectPick(o, ["x"]) satisfies { x: 0 };
    expect(result).toMatchInlineSnapshot(`
      {
        "x": 0,
      }
    `);
  });

  it("record", () => {
    const o: Record<string, number> = {
      x: 0,
      y: 1,
    };
    const result = objectPick(o, ["x"]) satisfies { x: number };
    expect(result).toMatchInlineSnapshot(`
      {
        "x": 0,
      }
    `);
  });
});

describe("objectOmit", () => {
  it("basic", () => {
    const o = {
      x: 0,
      y: 1,
    } as const;
    const result = objectOmit(o, ["x"]) satisfies { y: 1 };
    expect(result).toMatchInlineSnapshot(`
      {
        "y": 1,
      }
    `);
  });

  it("record", () => {
    const o: Record<string, number> = {
      x: 0,
      y: 1,
    };
    const result = objectOmit(o, ["x"]) satisfies Omit<
      Record<string, number>,
      "x"
    >;
    expect(result).toMatchInlineSnapshot(`
      {
        "y": 1,
      }
    `);
  });
});

describe("objectPickBy", () => {
  it("basic", () => {
    const result = objectPickBy(
      Object.fromEntries(groupBy(range(8), (x) => x % 3)),
      (_v, k) => Number(k) % 2 === 0
    );
    expect(result).toMatchInlineSnapshot(`
      {
        "0": [
          0,
          3,
          6,
        ],
        "2": [
          2,
          5,
        ],
      }
    `);
  });
});

describe("objectOmitBy", () => {
  it("basic", () => {
    const result = objectOmitBy(
      Object.fromEntries(groupBy(range(8), (x) => x % 3)),
      (_v, k) => Number(k) % 2 === 0
    );
    expect(result).toMatchInlineSnapshot(`
      {
        "1": [
          1,
          4,
          7,
        ],
      }
    `);
  });
});

describe("objectKeys", () => {
  it("basic", () => {
    const o = {
      x: 0,
      y: 1,
    };
    const result = objectKeys(o) satisfies ("x" | "y")[];
    expect(result).toMatchInlineSnapshot(`
      [
        "x",
        "y",
      ]
    `);
  });
});

describe("isNil", () => {
  it("typing-1", () => {
    const ls = [0, true, false, null, undefined] as const;

    ls.filter(isNil) satisfies (null | undefined)[];
    ls.filter(isNotNil) satisfies (0 | true | false)[];

    expect(ls.filter(isNil)).toMatchInlineSnapshot(`
      [
        null,
        undefined,
      ]
    `);
  });

  it("typing-2", () => {
    let x: number | undefined;

    expect(isNil(x)).toMatchInlineSnapshot("true");

    if (isNil(x)) {
      x satisfies undefined;
    } else {
      x satisfies number;
    }

    if (isNotNil(x)) {
      x satisfies number;
    } else {
      x satisfies undefined;
    }
  });
});

describe("once", () => {
  it("basic", () => {
    let count = 0;
    const f = once(() => ++count);

    expect(count).toMatchInlineSnapshot("0");
    expect(f()).toMatchInlineSnapshot("1");
    expect(count).toMatchInlineSnapshot("1");
    expect(f()).toMatchInlineSnapshot("1");
    expect(count).toMatchInlineSnapshot("1");
  });

  it("args", () => {
    let count = 0;
    const f = once((increment: number) => (count = count + increment));

    expect(count).toMatchInlineSnapshot("0");
    expect(f(2)).toMatchInlineSnapshot("2");
    expect(count).toMatchInlineSnapshot("2");
    expect(f(4)).toMatchInlineSnapshot("2");
    expect(count).toMatchInlineSnapshot("2");
  });
});

describe("zip", () => {
  it("basic", () => {
    const ls1 = range(2, 5);
    const ls2 = range(10, 20).map(String);
    const ls: [number, string][] = zip(ls1, ls2);
    expect(ls).toMatchInlineSnapshot(`
      [
        [
          2,
          "10",
        ],
        [
          3,
          "11",
        ],
        [
          4,
          "12",
        ],
      ]
    `);
  });
});

describe(difference.name, () => {
  it("basic", () => {
    expect(difference(range(2, 8), range(5, 10))).toMatchInlineSnapshot(`
      [
        2,
        3,
        4,
      ]
    `);
    expect(difference([], range(5, 10))).toMatchInlineSnapshot("[]");
    expect(difference(range(2, 8), [])).toMatchInlineSnapshot(`
      [
        2,
        3,
        4,
        5,
        6,
        7,
      ]
    `);
  });
});

describe(capitalize.name, () => {
  it("basic", () => {
    expect(capitalize("")).toMatchInlineSnapshot('""');
    expect(capitalize("abc")).toMatchInlineSnapshot('"Abc"');
    expect(capitalize("Abc")).toMatchInlineSnapshot('"Abc"');
    expect(capitalize("abc def")).toMatchInlineSnapshot('"Abc def"');
  });
});
