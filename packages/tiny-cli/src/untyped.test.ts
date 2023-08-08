import { describe, expect, it } from "vitest";
import { parseUntyped, parseUntypedSimple } from "./untyped";

describe(parseUntypedSimple, () => {
  it("basic", () => {
    expect(parseUntypedSimple([])).toMatchInlineSnapshot(`
      {
        "flags": [],
        "keyValues": [],
        "positionals": [],
      }
    `);

    const input = "a --k1 --k2 b --k3=x --k4=y -c d";
    expect(parseUntypedSimple(input.split(" "))).toMatchInlineSnapshot(`
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

describe(parseUntyped, () => {
  it("basic", () => {
    expect(parseUntyped([])).toMatchInlineSnapshot(`
      {
        "flags": [],
        "keyValues": [],
        "positionals": [],
      }
    `);

    const input = "a --k1 --k2 b --k3=x --k4=y -c d";
    expect(parseUntyped(input.split(" "))).toMatchInlineSnapshot(`
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
    expect(parseUntyped(input.split(" "), { flags: ["k2"] }))
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
