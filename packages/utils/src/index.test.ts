import { describe, expect, it } from "vitest";
import { typedBoolean } from "./boolean-guard";
import { defaultDict } from "./default-dict";
import { DefaultMap, UncheckedMap } from "./default-map";
import { groupBy, range } from "./lodash";
import { assertUnreachable } from "./misc";
import { mapOption } from "./option";
import { newPromiseWithResolvers } from "./promise";
import { Err, Ok, Result, okToOption, wrapError, wrapPromise } from "./result";
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

  describe("wrapPromise", async () => {
    async function boom(value: boolean) {
      if (value) {
        throw new Error("boom");
      }
      return 1;
    }

    it("success", async () => {
      const result = await wrapPromise(boom(false));
      result satisfies Result<number, unknown>;
      expect(result).toMatchInlineSnapshot(`
        {
          "ok": true,
          "value": 1,
        }
      `);
    });

    it("error", async () => {
      const result = await wrapPromise(boom(true));
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
    const result = await wrapPromise(promise);
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
    const result = await wrapPromise(promise);
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

    expect(f("a")).toMatchInlineSnapshot('0');

    const result = wrapError(() => g("b"));
    tinyassert(!result.ok);
    tinyassert(result.value instanceof Error);
    expect(result.value).toMatchInlineSnapshot('[Error: assertUnreachable]');
    expect(result.value.cause).toMatchInlineSnapshot('"b"');
  });
})
