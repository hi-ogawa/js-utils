import { describe, expect, it } from "vitest";
import {
  groupBy,
  isNil,
  mapKeys,
  mapValues,
  objectKeys,
  objectOmit,
  objectOmitBy,
  objectPick,
  objectPickBy,
  partition,
  pickBy,
  range,
  sortBy,
  uniqBy,
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
  it("typing", () => {
    const ls = [0, true, false, null, undefined] as const;

    ls.filter(isNil) satisfies (null | undefined)[];

    expect(ls.filter(isNil)).toMatchInlineSnapshot(`
      [
        null,
        undefined,
      ]
    `);
  });

  it("typing", () => {
    let x: number | undefined;

    expect(isNil(x)).toMatchInlineSnapshot("true");

    if (isNil(x)) {
      x satisfies undefined;
    } else {
      x satisfies number;
    }
  });
});
