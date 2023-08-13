import { describe, expect, it } from "vitest";
import { DefaultMap, HashKeyDefaultMap, UncheckedMap } from "./default-map";
import { groupBy, range } from "./lodash";
import { wrapError } from "./result";
import { tinyassert } from "./tinyassert";

describe(DefaultMap, () => {
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

describe(HashKeyDefaultMap, () => {
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
          "{\\"mod2\\":0,\\"mod3\\":0}" => [
            {
              "mod2": 0,
              "mod3": 0,
            },
            [
              0,
              6,
            ],
          ],
          "{\\"mod2\\":1,\\"mod3\\":1}" => [
            {
              "mod2": 1,
              "mod3": 1,
            },
            [
              1,
              7,
            ],
          ],
          "{\\"mod2\\":0,\\"mod3\\":2}" => [
            {
              "mod2": 0,
              "mod3": 2,
            },
            [
              2,
              8,
            ],
          ],
          "{\\"mod2\\":1,\\"mod3\\":0}" => [
            {
              "mod2": 1,
              "mod3": 0,
            },
            [
              3,
              9,
            ],
          ],
          "{\\"mod2\\":0,\\"mod3\\":1}" => [
            {
              "mod2": 0,
              "mod3": 1,
            },
            [
              4,
            ],
          ],
          "{\\"mod2\\":1,\\"mod3\\":2}" => [
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

describe(UncheckedMap, () => {
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
