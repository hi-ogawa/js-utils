import { describe, expect, it } from "vitest";
import { parseToUntypedArgs, parseToUntypedArgsSimple } from "./untyped";

describe(parseToUntypedArgsSimple, () => {
  it("basic", () => {
    expect(parseToUntypedArgsSimple([])).toMatchInlineSnapshot(`
      {
        "flags": [],
        "keyValues": [],
        "positionals": [],
      }
    `);

    const input = "a --k1 --k2 b --k3=x --k4=y -c d";
    expect(parseToUntypedArgsSimple(input.split(" "))).toMatchInlineSnapshot(`
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

describe(parseToUntypedArgs, () => {
  it("basic", () => {
    expect(parseToUntypedArgs([])).toMatchInlineSnapshot(`
      {
        "flags": [],
        "keyValues": [],
        "positionals": [],
      }
    `);

    const input = "a --k1 --k2 b --k3=x --k4=y -c d";
    expect(parseToUntypedArgs(input.split(" "))).toMatchInlineSnapshot(`
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
    expect(
      parseToUntypedArgs(input.split(" "), { flags: ["k2"] }),
    ).toMatchInlineSnapshot(`
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
