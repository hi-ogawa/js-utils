import { describe, expect, it } from "vitest";
import { parseArgs, simpleParseArgs } from "./utils";

describe(simpleParseArgs, () => {
  it("basic", () => {
    expect(simpleParseArgs([])).toMatchInlineSnapshot(`
      {
        "flags": [],
        "keyValues": [],
        "positionals": [],
      }
    `);

    const input = "a --k1 --k2 b --k3=x --k4=y -c d";
    expect(simpleParseArgs(input.split(" "))).toMatchInlineSnapshot(`
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

describe(parseArgs, () => {
  it("basic", () => {
    expect(parseArgs([])).toMatchInlineSnapshot(`
      {
        "flags": [],
        "keyValues": [],
        "positionals": [],
      }
    `);

    const input = "a --k1 --k2 b --k3=x --k4=y -c d";
    expect(parseArgs(input.split(" "))).toMatchInlineSnapshot(`
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
    expect(parseArgs(input.split(" "), { flags: ["k2"] }))
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
