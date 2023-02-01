import { describe, expect, it } from "vitest";
import { booleanGuard } from "./boolean-guard";
import { defaultDict } from "./default-dict";
import { DefaultMap } from "./default-map";
import { Err, Ok, Result, wrapError, wrapPromise } from "./result";

describe("booleanGuard", () => {
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
    const result2 = someArray.filter(booleanGuard) satisfies { x: number }[];
    expect(result1).toEqual(result2);
  });
});

describe("defaultDict", () => {
  it("basic", () => {
    const record = defaultDict<string, number[]>(() => [0]);

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

describe("defaultMap", () => {
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
});
