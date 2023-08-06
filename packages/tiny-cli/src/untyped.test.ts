import { describe, expect, it } from "vitest";
import { parseRawArgsToUntyped, parseRawArgsToUntypedSimple } from "./untyped";

describe(parseRawArgsToUntypedSimple, () => {
  it("basic", () => {
    expect(parseRawArgsToUntypedSimple([])).toMatchInlineSnapshot(`
      {
        "flags": [],
        "keyValues": [],
        "positionals": [],
      }
    `);

    const input = "a --k1 --k2 b --k3=x --k4=y -c d";
    expect(parseRawArgsToUntypedSimple(input.split(" ")))
      .toMatchInlineSnapshot(`
      {
        "flags": [
          "k1",
          "k2",
        ],
        "keyValues": [
          [
            "k3",
            "x",
          ],
          [
            "k4",
            "y",
          ],
        ],
        "positionals": [
          "a",
          "b",
          "-c",
          "d",
        ],
      }
    `);
  });
});

describe(parseRawArgsToUntyped, () => {
  it("basic", () => {
    expect(parseRawArgsToUntyped([])).toMatchInlineSnapshot(`
      {
        "flags": [],
        "keyValues": [],
        "positionals": [],
      }
    `);

    const input = "a --k1 --k2 b --k3=x --k4=y -c d";
    expect(parseRawArgsToUntyped(input.split(" "))).toMatchInlineSnapshot(`
      {
        "flags": [
          "k1",
        ],
        "keyValues": [
          [
            "k2",
            "b",
          ],
          [
            "k3",
            "x",
          ],
          [
            "k4",
            "y",
          ],
        ],
        "positionals": [
          "a",
          "-c",
          "d",
        ],
      }
    `);
  });

  it("flags", () => {
    const input = "a --k1 --k2 b --k3=x --k4=y -c d";
    expect(parseRawArgsToUntyped(input.split(" "), { flags: ["k2"] }))
      .toMatchInlineSnapshot(`
      {
        "flags": [
          "k1",
          "k2",
        ],
        "keyValues": [
          [
            "k3",
            "x",
          ],
          [
            "k4",
            "y",
          ],
        ],
        "positionals": [
          "a",
          "b",
          "-c",
          "d",
        ],
      }
    `);
  });
});
