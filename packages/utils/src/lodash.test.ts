import {
  afterEach,
  beforeEach,
  describe,
  expect,
  expectTypeOf,
  it,
  vi,
} from "vitest";
import { LruCache } from "./cache";
import {
  capitalize,
  debounce,
  delay,
  difference,
  groupBy,
  isNil,
  isNotNil,
  mapGroupBy,
  mapKeys,
  mapValues,
  memoize,
  objectEntries,
  objectFromEntries,
  objectHas,
  objectKeys,
  objectMapKeys,
  objectMapValues,
  objectOmit,
  objectOmitBy,
  objectPick,
  objectPickBy,
  once,
  partition,
  pickBy,
  range,
  sortBy,
  splitByChunk,
  uniqBy,
  zip,
  zipMax,
} from "./lodash";
import { tinyassert } from "./tinyassert";

describe(range, () => {
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

    expect(range(1, 0)).toMatchInlineSnapshot("[]");
    expect(range(-1)).toMatchInlineSnapshot("[]");
  });
});

describe(splitByChunk, () => {
  it("basic", () => {
    expect(splitByChunk(range(10), 3)).toMatchInlineSnapshot(`
      [
        [
          0,
          1,
          2,
        ],
        [
          3,
          4,
          5,
        ],
        [
          6,
          7,
          8,
        ],
        [
          9,
        ],
      ]
    `);
    expect(splitByChunk(range(10), 5)).toMatchInlineSnapshot(`
      [
        [
          0,
          1,
          2,
          3,
          4,
        ],
        [
          5,
          6,
          7,
          8,
          9,
        ],
      ]
    `);
  });

  it("exotic", () => {
    expect(splitByChunk(range(10), 0)).toMatchInlineSnapshot("[]");
    expect(splitByChunk(range(10), -1)).toMatchInlineSnapshot("[]");
    expect(splitByChunk(range(10), 0.5)).toMatchInlineSnapshot("[]");
    expect(splitByChunk(range(10), 1.5)).toMatchInlineSnapshot("[]");
  });
});

describe(groupBy, () => {
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

describe(mapKeys, () => {
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

describe(mapValues, () => {
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

describe(mapGroupBy, () => {
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

describe(pickBy, () => {
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

describe(partition, () => {
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

describe(sortBy, () => {
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

describe(uniqBy, () => {
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

describe(objectPick, () => {
  it("basic", () => {
    const o = {
      x: 0,
      y: 1,
    } as const;
    const result = objectPick(o, ["x"]);
    expect(result).toMatchInlineSnapshot(`
      {
        "x": 0,
      }
    `);
    expectTypeOf(result).toEqualTypeOf<{ readonly x: 0 }>();
  });

  it("record", () => {
    const o: Record<string, number> = {
      x: 0,
      y: 1,
    };
    const result = objectPick(o, ["x"]);
    expect(result).toMatchInlineSnapshot(`
      {
        "x": 0,
      }
    `);
    expectTypeOf(result).toEqualTypeOf<{ x: number }>();
  });
});

describe(objectOmit, () => {
  it("basic", () => {
    const o = {
      x: 0,
      y: 1,
    } as const;
    const result = objectOmit(o, ["x"]);
    expect(result).toMatchInlineSnapshot(`
      {
        "y": 1,
      }
    `);
    expectTypeOf(result).toEqualTypeOf<{ readonly y: 1 }>();
  });

  it("record", () => {
    const o: Record<string, number> = {
      x: 0,
      y: 1,
    };
    const result = objectOmit(o, ["x"]);
    expect(result).toMatchInlineSnapshot(`
      {
        "y": 1,
      }
    `);
  });
});

describe(objectPickBy, () => {
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

describe(objectOmitBy, () => {
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

describe(objectKeys, () => {
  it("basic", () => {
    const o = {
      x: 0,
      y: 1,
    };
    const result = objectKeys(o);
    expect(result).toMatchInlineSnapshot(`
      [
        "x",
        "y",
      ]
    `);
    expectTypeOf(result).toEqualTypeOf<("x" | "y")[]>();
  });
});

describe(`${objectEntries.name}/${objectFromEntries.name}`, () => {
  it("basic", () => {
    const o = {
      x: 0,
      y: 1,
    };
    const entries = objectEntries(o);
    expectTypeOf(entries).toEqualTypeOf<(["x", number] | ["y", number])[]>();
    expect(entries).toMatchInlineSnapshot(`
      [
        [
          "x",
          0,
        ],
        [
          "y",
          1,
        ],
      ]
    `);
    const o2 = objectFromEntries(entries);
    expectTypeOf(o2).toEqualTypeOf<Record<"x" | "y", number>>();
    expect(o2).toMatchInlineSnapshot(`
      {
        "x": 0,
        "y": 1,
      }
    `);
  });
});

describe(`${objectMapValues.name}/${objectMapKeys.name}`, () => {
  it("basic", () => {
    const o = {
      x: 1,
      y: 2,
    };
    {
      const result = objectMapValues(o, (v, k) => k.repeat(v));
      expectTypeOf(result).toEqualTypeOf<Record<"x" | "y", string>>();
      expect(result).toMatchInlineSnapshot(`
        {
          "x": "x",
          "y": "yy",
        }
      `);
    }
    {
      const result = objectMapKeys(o, (v) => (v === 1 ? "w" : "z"));
      expectTypeOf(result).toEqualTypeOf<Record<"z" | "w", number>>();
      expect(result).toMatchInlineSnapshot(`
        {
          "w": 1,
          "z": 2,
        }
      `);
    }
  });

  it("optional", () => {
    interface TestOptional {
      x: number;
      y?: number;
      z?: number;
    }
    const o: TestOptional = {
      x: 3,
      z: undefined,
    };
    {
      const result = objectMapValues(o, (v, k) => (v ? k.repeat(v) : "bad-v"));
      result satisfies {
        x: string;
        y?: string;
        z?: string;
      };
      expect(result).toMatchInlineSnapshot(`
        {
          "x": "xxx",
          "z": "bad-v",
        }
      `);
    }
    {
      const result = objectMapKeys(o, (v, k) => (v ? k.repeat(v) : "bad-k"));
      result satisfies Partial<Record<string, number>>;
      expect(result).toMatchInlineSnapshot(`
        {
          "bad-k": undefined,
          "xxx": 3,
        }
      `);
    }
  });
});

describe(objectHas, () => {
  it("basic", () => {
    const headers: unknown = { alg: "HS256" };

    // @ts-expect-error
    headers.alg;

    if (objectHas(headers, "alg")) {
      // ok
      headers.alg;
    }

    // @ts-expect-error
    headers.alg;

    // ok
    tinyassert(objectHas(headers, "alg"));
    headers.alg;
  });
});

describe(isNil, () => {
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

describe(once, () => {
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

describe(memoize, () => {
  it("basic", () => {
    const f = vi.fn().mockImplementation((v: number) => v + 10);
    const g = memoize(f);
    expect(g(1)).toMatchInlineSnapshot("11");
    expect(g(1)).toMatchInlineSnapshot("11");
    expect(g(2)).toMatchInlineSnapshot("12");
    expect(g(2)).toMatchInlineSnapshot("12");
    expect(f.mock.calls).toMatchInlineSnapshot(`
      [
        [
          1,
        ],
        [
          2,
        ],
      ]
    `);
  });

  it("default cache key is 1st argument", () => {
    const f = vi.fn().mockImplementation((x: number, y: number) => x + y);
    const g = memoize(f);
    expect(g(1, 2)).toMatchInlineSnapshot("3");
    expect(g(1, 3)).toMatchInlineSnapshot("3");
    expect(g(1, 2)).toMatchInlineSnapshot("3");
    expect(g(1, 3)).toMatchInlineSnapshot("3");
    expect(f.mock.calls).toMatchInlineSnapshot(`
      [
        [
          1,
          2,
        ],
      ]
    `);
  });

  it("options", () => {
    const f = vi.fn().mockImplementation((x: number, y: number) => x + y);
    const cache = new Map();
    const g = memoize(f, { cache, keyFn: (...args) => JSON.stringify(args) });
    expect(g(1, 2)).toMatchInlineSnapshot("3");
    expect(g(1, 3)).toMatchInlineSnapshot("4");
    expect(g(1, 2)).toMatchInlineSnapshot("3");
    expect(g(1, 3)).toMatchInlineSnapshot("4");
    expect(f.mock.calls).toMatchInlineSnapshot(`
      [
        [
          1,
          2,
        ],
        [
          1,
          3,
        ],
      ]
    `);
    expect(cache).toMatchInlineSnapshot(`
      Map {
        "[1,2]" => 3,
        "[1,3]" => 4,
      }
    `);
  });

  it("'undefined' not cached", () => {
    const f = vi
      .fn()
      .mockImplementation((v: number) => (v > 0 ? v + 10 : undefined));
    const g = memoize(f);
    expect(g(0)).toMatchInlineSnapshot("undefined");
    expect(g(0)).toMatchInlineSnapshot("undefined");
    expect(g(1)).toMatchInlineSnapshot("11");
    expect(g(1)).toMatchInlineSnapshot("11");
    expect(f.mock.calls).toMatchInlineSnapshot(`
      [
        [
          0,
        ],
        [
          0,
        ],
        [
          1,
        ],
      ]
    `);
  });

  it("object", () => {
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

  it("with LruCache", () => {
    const f = vi.fn().mockImplementation((x: number) => x * 2);
    const g = memoize(f, { cache: new LruCache(3) });
    expect(range(3).map((e) => g(e))).toMatchInlineSnapshot(`
      [
        0,
        2,
        4,
      ]
    `);
    expect(f.mock.calls).toMatchInlineSnapshot(`
      [
        [
          0,
        ],
        [
          1,
        ],
        [
          2,
        ],
      ]
    `);
    expect(range(1, 4).map((e) => g(e))).toMatchInlineSnapshot(`
      [
        2,
        4,
        6,
      ]
    `);
    expect(f.mock.calls).toMatchInlineSnapshot(`
      [
        [
          0,
        ],
        [
          1,
        ],
        [
          2,
        ],
        [
          3,
        ],
      ]
    `);
  });
});

describe(zip, () => {
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

describe(zipMax, () => {
  it("basic", () => {
    const ls1 = range(2, 4);
    const ls2 = range(10, 14).map(String);
    expect(zipMax(ls1, ls2)).toMatchInlineSnapshot(`
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
          undefined,
          "12",
        ],
        [
          undefined,
          "13",
        ],
      ]
    `);
    expect(zipMax(ls2, ls1)).toMatchInlineSnapshot(`
      [
        [
          "10",
          2,
        ],
        [
          "11",
          3,
        ],
        [
          "12",
          undefined,
        ],
        [
          "13",
          undefined,
        ],
      ]
    `);
  });
});

describe(difference, () => {
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

describe(capitalize, () => {
  it("basic", () => {
    expect(capitalize("")).toMatchInlineSnapshot('""');
    expect(capitalize("abc")).toMatchInlineSnapshot('"Abc"');
    expect(capitalize("Abc")).toMatchInlineSnapshot('"Abc"');
    expect(capitalize("abc def")).toMatchInlineSnapshot('"Abc def"');
  });
});

describe(debounce, () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("basic", () => {
    const calls: any[] = [];
    const g = debounce((x: number) => calls.push(x), 100);

    g(0);
    expect(calls).toMatchInlineSnapshot("[]");

    g(1);
    expect(calls).toMatchInlineSnapshot("[]");

    vi.runAllTimers();
    expect(calls).toMatchInlineSnapshot(`
      [
        1,
      ]
    `);

    g(2);
    g(3);
    expect(calls).toMatchInlineSnapshot(`
      [
        1,
      ]
    `);

    vi.runAllTimers();
    expect(calls).toMatchInlineSnapshot(`
      [
        1,
        3,
      ]
    `);

    g(4);
    g(5);
    g.cancel();
    vi.runAllTimers();
    expect(calls).toMatchInlineSnapshot(`
      [
        1,
        3,
      ]
    `);
  });
});

describe(delay, () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("basic", () => {
    const calls: any[] = [];
    const g = delay((x: number) => calls.push(x), 100);

    g(0);
    expect(calls).toMatchInlineSnapshot("[]");

    g(1);
    expect(calls).toMatchInlineSnapshot("[]");

    vi.runAllTimers();
    expect(calls).toMatchInlineSnapshot(`
      [
        0,
        1,
      ]
    `);

    g(2);
    g(3);
    expect(calls).toMatchInlineSnapshot(`
      [
        0,
        1,
      ]
    `);

    vi.runAllTimers();
    expect(calls).toMatchInlineSnapshot(`
      [
        0,
        1,
        2,
        3,
      ]
    `);

    g(4);
    g(5);
    g.cancel();
    vi.runAllTimers();
    expect(calls).toMatchInlineSnapshot(`
      [
        0,
        1,
        2,
        3,
      ]
    `);
  });
});
