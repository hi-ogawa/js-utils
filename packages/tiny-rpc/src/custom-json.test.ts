import { tinyassert } from "@hiogawa/utils";
import { describe, expect, it } from "vitest";
import { ZodError, z } from "zod";
import {
  createCustomJson,
  createCustomJsonReplacer,
  createCustomJsonReviver,
  defineExtension,
} from "./custom-json";

describe("json", () => {
  it("custom type", () => {
    const customJson = createCustomJson({
      extensions: {
        ZodError: defineExtension<ZodError>({
          match: (v): v is ZodError => v instanceof ZodError,
          stringify: (v) => JSON.stringify(v.issues),
          parse: (s) => new ZodError(JSON.parse(s)),
        }),
      },
    });

    const error = z.object({ int: z.number().int() }).safeParse({ int: 1.23 });
    tinyassert(!error.success);

    const original = {
      ok: false,
      value: error.error,
    };

    const stringified = customJson.stringify(original, null, 2);
    expect(stringified).toMatchInlineSnapshot(
      `
      "{
        \\"ok\\": false,
        \\"value\\": \\"!ZodError:[{\\\\\\"code\\\\\\":\\\\\\"invalid_type\\\\\\",\\\\\\"expected\\\\\\":\\\\\\"integer\\\\\\",\\\\\\"received\\\\\\":\\\\\\"float\\\\\\",\\\\\\"message\\\\\\":\\\\\\"Expected integer, received float\\\\\\",\\\\\\"path\\\\\\":[\\\\\\"int\\\\\\"]}]\\"
      }"
    `
    );
    const revived = customJson.parse(stringified);
    expect(revived).toMatchInlineSnapshot(`
      {
        "ok": false,
        "value": [ZodError: [
        {
          "code": "invalid_type",
          "expected": "integer",
          "received": "float",
          "message": "Expected integer, received float",
          "path": [
            "int"
          ]
        }
      ]],
      }
    `);
    expect(revived).toEqual(original);
  });

  it("misc", () => {
    class X {
      name = "hello";
    }

    class Y {
      toJSON() {
        return "foo";
      }
    }

    const v = {
      date: new Date("2023-08-17"),
      x: new X(),
      y: new Y(),
      z: {
        toJSON: () => "zzz",
      },
      w: {
        toJSON: "www",
      },
      u: {
        toJSON: () => () => "uuu",
      },
      f: () => {},
      undefined: undefined,
      s0: "xyz",
      s1: "!xyz",
      s2: "!!xyz",
      NaN: NaN,
      Infinity: Infinity,
      regexp: /^\d+$/g,
    };

    const s = JSON.stringify(v, createCustomJsonReplacer(), 2);
    expect(s).toMatchInlineSnapshot(`
      "{
        \\"date\\": \\"!Date:2023-08-17T00:00:00.000Z\\",
        \\"x\\": {
          \\"name\\": \\"hello\\"
        },
        \\"y\\": \\"foo\\",
        \\"z\\": \\"zzz\\",
        \\"w\\": {
          \\"toJSON\\": \\"www\\"
        },
        \\"undefined\\": \\"!undefined:\\",
        \\"s0\\": \\"xyz\\",
        \\"s1\\": \\"!:!xyz\\",
        \\"s2\\": \\"!:!!xyz\\",
        \\"NaN\\": null,
        \\"Infinity\\": null,
        \\"regexp\\": {}
      }"
    `);

    const v2 = JSON.parse(s, createCustomJsonReviver());
    expect(v2).toMatchInlineSnapshot(`
      {
        "Infinity": null,
        "NaN": null,
        "date": 2023-08-17T00:00:00.000Z,
        "regexp": {},
        "s0": "xyz",
        "s1": "!xyz",
        "s2": "!!xyz",
        "w": {
          "toJSON": "www",
        },
        "x": {
          "name": "hello",
        },
        "y": "foo",
        "z": "zzz",
      }
    `);
  });
});
