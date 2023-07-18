import { describe, expect, it } from "vitest";
import { defaultDict } from "./default-dict";
import { DefaultMap, HashKeyDefaultMap, UncheckedMap } from "./default-map";
import { groupBy, range } from "./lodash";
import { arrayToEnum, assertUnreachable, typedBoolean } from "./misc";
import { mapOption } from "./option";
import { mapPromise, newPromiseWithResolvers } from "./promise";
import { escapeRegExp, mapRegExp, regExpRaw } from "./regexp";
import {
  Err,
  Ok,
  type Result,
  okToOption,
  wrapError,
  wrapErrorAsync,
} from "./result";
import { tinyassert } from "./tinyassert";

describe("typedBoolean", () => {
  it("basic", () => {
    const someBoolean = true as boolean;
    const numberOrNull = null as number | null;
    const stringOrUndefined = undefined as string | undefined;
    const someArray = [
      { x: 1 },
      someBoolean && { x: 2 },
      numberOrNull && { x: 3 },
      stringOrUndefined && { x: 4 },
    ];

    const result1 = someArray.filter(Boolean);
    const result2 = someArray.filter(typedBoolean) satisfies { x: number }[];
    expect(result1).toEqual(result2);
  });
});

describe(arrayToEnum, () => {
  it("basic", () => {
    const e = arrayToEnum(["x", "y"]);
    e satisfies {
      x: "x";
      y: "y";
    };
    expect(e).toMatchInlineSnapshot(`
      {
        "x": "x",
        "y": "y",
      }
    `);
  });

  it("const", () => {
    const src = ["x", "y"] as const;
    const e = arrayToEnum(src);
    e satisfies {
      x: "x";
      y: "y";
    };
    expect(e).toMatchInlineSnapshot(`
      {
        "x": "x",
        "y": "y",
      }
    `);
  });

  it("destructure", () => {
    const src = ["x", "y"] as const;
    const e = arrayToEnum(["w", ...src, "z"]);
    e satisfies {
      w: "w";
      x: "x";
      y: "y";
      z: "z";
    };
    expect(e).toMatchInlineSnapshot(`
      {
        "w": "w",
        "x": "x",
        "y": "y",
        "z": "z",
      }
    `);
  });

  it("number", () => {
    const s = Symbol("s");
    const e = arrayToEnum([0, 1, "x", "y", s]);
    e satisfies {
      0: 0;
      1: 1;
      x: "x";
      y: "y";
      [s]: typeof s;
    };
    expect(e).toMatchInlineSnapshot(`
      {
        "0": 0,
        "1": 1,
        "x": "x",
        "y": "y",
        Symbol(s): Symbol(s),
      }
    `);
    expect(e[0]).toMatchInlineSnapshot("0");
    expect(e.x).toMatchInlineSnapshot('"x"');
    expect(e[s]).toMatchInlineSnapshot("Symbol(s)");
  });
});

describe("defaultDict", () => {
  it("basic", () => {
    const record = defaultDict(() => [0]);

    // `Proxy` itself breaks vitest snapshot with the following error message:
    //   PrettyFormatPluginError: val.getMockName is not a function
    expect({ ...record }).toMatchInlineSnapshot("{}");

    record["x"] = [1];
    expect({ ...record }).toMatchInlineSnapshot(`
      {
        "x": [
          1,
        ],
      }
    `);

    record["y"]?.push(1);
    expect({ ...record }).toMatchInlineSnapshot(`
      {
        "x": [
          1,
        ],
        "y": [
          0,
          1,
        ],
      }
    `);
  });
});

describe("DefaultMap", () => {
  it("basic", () => {
    const map: DefaultMap<string, number[]> = new DefaultMap(() => [0]);
    expect(map).toMatchInlineSnapshot("Map {}");

    map.get("x");
    expect(map).toMatchInlineSnapshot(`
      Map {
        "x" => [
          0,
        ],
      }
    `);
    map.delete("x");
    expect(map).toMatchInlineSnapshot("Map {}");

    map.get("y").push(1);
    expect(map).toMatchInlineSnapshot(`
      Map {
        "y" => [
          0,
          1,
        ],
      }
    `);
  });

  it("constructor-Iterable", () => {
    const map = new DefaultMap(
      () => [],
      groupBy(range(10), (x) => x % 3)
    );
    map satisfies DefaultMap<number, number[]>;
    expect(map).toMatchInlineSnapshot(`
      Map {
        0 => [
          0,
          3,
          6,
          9,
        ],
        1 => [
          1,
          4,
          7,
        ],
        2 => [
          2,
          5,
          8,
        ],
      }
    `);
    expect(map.get(100)).toMatchInlineSnapshot("[]");
    expect(map).toMatchInlineSnapshot(`
      Map {
        0 => [
          0,
          3,
          6,
          9,
        ],
        1 => [
          1,
          4,
          7,
        ],
        2 => [
          2,
          5,
          8,
        ],
        100 => [],
      }
    `);
  });
});

describe(HashKeyDefaultMap.name, () => {
  it("basic", () => {
    const map: HashKeyDefaultMap<{ mod2: number; mod3: number }, number[]> =
      new HashKeyDefaultMap(() => []);

    for (const x of range(10)) {
      map.get({ mod2: x % 2, mod3: x % 3 }).push(x);
    }

    expect(map).toMatchInlineSnapshot(`
      HashKeyDefaultMap {
        "defaultFn": [Function],
        "keyFn": [Function],
        "map": Map {
          "[[\\"mod2\\",0],[\\"mod3\\",0]]" => [
            {
              "mod2": 0,
              "mod3": 0,
            },
            [
              0,
              6,
            ],
          ],
          "[[\\"mod2\\",1],[\\"mod3\\",1]]" => [
            {
              "mod2": 1,
              "mod3": 1,
            },
            [
              1,
              7,
            ],
          ],
          "[[\\"mod2\\",0],[\\"mod3\\",2]]" => [
            {
              "mod2": 0,
              "mod3": 2,
            },
            [
              2,
              8,
            ],
          ],
          "[[\\"mod2\\",1],[\\"mod3\\",0]]" => [
            {
              "mod2": 1,
              "mod3": 0,
            },
            [
              3,
              9,
            ],
          ],
          "[[\\"mod2\\",0],[\\"mod3\\",1]]" => [
            {
              "mod2": 0,
              "mod3": 1,
            },
            [
              4,
            ],
          ],
          "[[\\"mod2\\",1],[\\"mod3\\",2]]" => [
            {
              "mod2": 1,
              "mod3": 2,
            },
            [
              5,
            ],
          ],
        },
      }
    `);
  });
});

describe("UncheckedMap", () => {
  it("basic", () => {
    const map = new UncheckedMap<string, number>();
    expect(map).toMatchInlineSnapshot("Map {}");

    expect(wrapError(() => map.get("x"))).toMatchInlineSnapshot(`
      {
        "ok": false,
        "value": [Error: UncheckedMap],
      }
    `);
    expect(map.set("x", 1)).toMatchInlineSnapshot(`
      Map {
        "x" => 1,
      }
    `);
    expect(wrapError(() => map.get("x"))).toMatchInlineSnapshot(`
      {
        "ok": true,
        "value": 1,
      }
    `);
    expect(map.delete("x")).toMatchInlineSnapshot("true");

    const result = wrapError(() => map.get("x"));
    tinyassert(result.value instanceof Error);
    expect(result.value).toMatchInlineSnapshot("[Error: UncheckedMap]");
    expect(result.value.cause).toMatchInlineSnapshot(`
      {
        "key": "x",
      }
    `);
  });

  it("constructor", () => {
    const map = new UncheckedMap(range(8).map((i) => [i, String(i % 3)]));
    map satisfies UncheckedMap<number, string>;
    expect(wrapError(() => map.get(4))).toMatchInlineSnapshot(`
      {
        "ok": true,
        "value": "1",
      }
    `);
    expect(wrapError(() => map.get(8))).toMatchInlineSnapshot(`
      {
        "ok": false,
        "value": [Error: UncheckedMap],
      }
    `);
  });
});

describe("Result", () => {
  it("basic", () => {
    expect(Ok(1)).toMatchInlineSnapshot(`
      {
        "ok": true,
        "value": 1,
      }
    `);
    expect(Err("boom")).toMatchInlineSnapshot(`
      {
        "ok": false,
        "value": "boom",
      }
    `);
  });

  it("type-gurad", () => {
    function boom(value: boolean): Result<number, string> {
      return value ? Ok(1) : Err("boom");
    }
    const result = boom(true);
    if (result.ok) {
      result.value satisfies number;
    } else {
      result.value satisfies string;
    }
  });

  describe("wrapError", () => {
    function boom(value: boolean) {
      if (value) {
        throw new Error("boom");
      }
      return 1;
    }

    it("success", () => {
      const result = wrapError(() => boom(false));
      result satisfies Result<number, unknown>;
      expect(result).toMatchInlineSnapshot(`
        {
          "ok": true,
          "value": 1,
        }
      `);
    });

    it("error", () => {
      const result = wrapError(() => boom(true));
      result satisfies Result<number, unknown>;
      expect(result).toMatchInlineSnapshot(`
        {
          "ok": false,
          "value": [Error: boom],
        }
      `);
    });
  });

  describe(wrapErrorAsync, async () => {
    async function boom(value: boolean) {
      if (value) {
        throw new Error("boom");
      }
      return 1;
    }

    it("success", async () => {
      const result = await wrapErrorAsync(() => boom(false));
      result satisfies Result<number, unknown>;
      expect(result).toMatchInlineSnapshot(`
        {
          "ok": true,
          "value": 1,
        }
      `);
    });

    it("error", async () => {
      const result = await wrapErrorAsync(() => boom(true));
      result satisfies Result<number, unknown>;
      expect(result).toMatchInlineSnapshot(`
        {
          "ok": false,
          "value": [Error: boom],
        }
      `);
    });
  });

  describe("okToOption", () => {
    it("basic", () => {
      expect(okToOption(Ok(1))).toMatchInlineSnapshot("1");
      expect(okToOption(Err("xxx"))).toMatchInlineSnapshot("undefined");
    });
  });
});

describe("mapOption", () => {
  it("basic", () => {
    const map = groupBy(range(8), (x) => x % 3);
    const result = mapOption(map.get(0), (v) => v.length) satisfies
      | number
      | undefined;
    expect(result).toMatchInlineSnapshot("3");
  });
});

describe("newPromiseWithResolvers", () => {
  it("resolve", async () => {
    const { promise, resolve } = newPromiseWithResolvers<number>();
    resolve(123);
    const result = await wrapErrorAsync(() => promise);
    expect(result).toMatchInlineSnapshot(`
      {
        "ok": true,
        "value": 123,
      }
    `);
  });

  it("reject", async () => {
    const { promise, reject } = newPromiseWithResolvers<number>();
    reject(123);
    const result = await wrapErrorAsync(() => promise);
    expect(result).toMatchInlineSnapshot(`
      {
        "ok": false,
        "value": 123,
      }
    `);
  });
});

describe(assertUnreachable.name, () => {
  it("basic", () => {
    type X = "a" | "b";

    function f(x: X) {
      if (x === "a") {
        return 0;
      }
      if (x === "b") {
        return 0;
      }
      assertUnreachable(x);
    }

    function g(x: X) {
      if (x === "a") {
        return 0;
      }
      // @ts-expect-error
      assertUnreachable(x);
    }

    expect(f("a")).toMatchInlineSnapshot("0");

    const result = wrapError(() => g("b"));
    tinyassert(!result.ok);
    tinyassert(result.value instanceof Error);
    expect(result.value).toMatchInlineSnapshot("[Error: assertUnreachable]");
    expect(result.value.cause).toMatchInlineSnapshot('"b"');
  });
});

describe(regExpRaw.name, () => {
  it("basic", () => {
    const re = regExpRaw`/username/${/\w+/}/profile`;
    expect(re).toMatchInlineSnapshot(
      "/\\\\/username\\\\/\\\\w\\+\\\\/profile/"
    );
    expect(re.source).toMatchInlineSnapshot(
      '"\\\\/username\\\\/\\\\w+\\\\/profile"'
    );
    expect("/username/hey/profile".match(re)).toMatchInlineSnapshot(`
      [
        "/username/hey/profile",
      ]
    `);
    expect("/username/he y/profile".match(re)).toMatchInlineSnapshot("null");
  });
});

describe(escapeRegExp.name, () => {
  it("basic", () => {
    const re = escapeRegExp("/remix/$id/hello.ts");
    expect(re).toMatchInlineSnapshot(
      '"\\\\/remix\\\\/\\\\$id\\\\/hello\\\\.ts"'
    );
    expect("/remix/$id/hello.ts".match(re)).toMatchInlineSnapshot(`
      [
        "/remix/$id/hello.ts",
      ]
    `);
    expect("/remix/$id/helloxts".match(re)).toMatchInlineSnapshot("null");
  });
});

describe(mapRegExp.name, () => {
  it("basic", () => {
    function transform(input: string): string {
      let output = "";
      mapRegExp(
        input,
        /{{(.*?)}}/g,
        (match) => {
          output += String(eval(match[1]));
        },
        (other) => {
          output += other;
        }
      );
      return output;
    }

    expect(transform("hello")).toMatchInlineSnapshot('"hello"');
    expect(transform("x = {{ 1 + 2 }}")).toMatchInlineSnapshot('"x = 3"');
    expect(transform("x = {{ 1 + 2 }}, y = {{ 4 * 5 }}")).toMatchInlineSnapshot(
      '"x = 3, y = 20"'
    );
  });
});

describe.only(mapPromise, () => {
  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(() => resolve(null), ms));
  }

  it("basic", async () => {
    const logs: any[] = [];
    const gen = mapPromise(
      range(10).reverse(),
      async (v, i) => {
        await sleep(v * 100);
        return { v, i };
      },
      {
        concurrency: 3,
      }
    );

    let results: any[] = [];
    for await (const v of gen) {
      results.push(v);
    }
    expect(results).toMatchInlineSnapshot(`
      [
        {
          "i": 2,
          "v": 7,
        },
        {
          "i": 1,
          "v": 8,
        },
        {
          "i": 0,
          "v": 9,
        },
        {
          "i": 5,
          "v": 4,
        },
        {
          "i": 3,
          "v": 6,
        },
        {
          "i": 4,
          "v": 5,
        },
        {
          "i": 8,
          "v": 1,
        },
        {
          "i": 9,
          "v": 0,
        },
        {
          "i": 7,
          "v": 2,
        },
        {
          "i": 6,
          "v": 3,
        },
      ]
    `);
    expect(logs).toMatchInlineSnapshot("[]");
  });
});
