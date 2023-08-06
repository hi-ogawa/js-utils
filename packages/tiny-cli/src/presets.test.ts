import { describe, expect, it } from "vitest";
import { argPresets } from "./presets";
import { defineCommand } from "./typed";

describe("argPresets", () => {
  it("basic", () => {
    const example = defineCommand(
      {
        args: {
          positionalString: argPresets.string("", { positional: true }),
          positionalNumberDefault: argPresets.number("", {
            positional: true,
            default: 123,
          }),
          positionalNumberOptional: argPresets.number("", {
            positional: true,
            optional: true,
          }),
          testBoolean: argPresets.boolean("hello boolean"),
          testString: argPresets.string("hello string"),
          testStringOpt: argPresets.string("hello optional string", {
            optional: true,
          }),
          testStringOptDefault: argPresets.string("hello default string", {
            default: "default-string",
          }),
        },
      },
      ({ args }) => {
        args satisfies {
          positionalString: string;
          positionalNumberDefault: number;
          positionalNumberOptional?: number;
          testBoolean: boolean;
          testString: string;
          testStringOpt?: string;
          testStringOptDefault: string;
        };
        return args;
      }
    );

    expect(example.help()).toMatchInlineSnapshot(`
      "usage:
        $ (cli) [options] <positionalString> <positionalNumberDefault> <positionalNumberOptional>

      positional arguments:
        positionalString
        positionalNumberDefault
        positionalNumberOptional

      options:
        --testString=...              hello string
        --testStringOpt=...           hello optional string
        --testStringOptDefault=...    hello default string
        --testBoolean                 hello boolean
      "
    `);

    expect(() => example.parse([])).toThrowErrorMatchingInlineSnapshot(
      '"failed to parse <positionalString>"'
    );

    expect(() =>
      example.parse(["hello", "not-a-number"])
    ).toThrowErrorMatchingInlineSnapshot(
      '"failed to parse <positionalNumberDefault>"'
    );

    expect(() =>
      example.parse(["hello", "123", "not-a-number"])
    ).toThrowErrorMatchingInlineSnapshot(
      '"failed to parse <positionalNumberOptional>"'
    );

    expect(example.parse(["hello", "123", "456", "--testString", "hey"]))
      .toMatchInlineSnapshot(`
      {
        "positionalNumberDefault": 123,
        "positionalNumberOptional": 456,
        "positionalString": "hello",
        "testBoolean": false,
        "testString": "hey",
        "testStringOpt": undefined,
        "testStringOptDefault": "default-string",
      }
    `);

    expect(example.parse(["--testString", "hey", "--testBoolean", "hello"]))
      .toMatchInlineSnapshot(`
        {
          "positionalNumberDefault": 123,
          "positionalNumberOptional": undefined,
          "positionalString": "hello",
          "testBoolean": true,
          "testString": "hey",
          "testStringOpt": undefined,
          "testStringOptDefault": "default-string",
        }
      `);
  });

  it("stringArray", () => {
    const example = defineCommand(
      {
        args: {
          testArray: argPresets.stringArray("hello array"),
        },
      },
      ({ args }) => {
        args satisfies {
          testArray: string[];
        };
        return args;
      }
    );

    expect(example.help()).toMatchInlineSnapshot(`
      "usage:
        $ (cli) <testArray...>

      positional arguments:
        testArray    hello array
      "
    `);

    expect(example.parse([])).toMatchInlineSnapshot(`
        {
          "testArray": [],
        }
      `);

    expect(example.parse(["a", "b", "1", "2"])).toMatchInlineSnapshot(`
      {
        "testArray": [
          "a",
          "b",
          "1",
          "2",
        ],
      }
    `);
  });

  it("numberArray", () => {
    const example = defineCommand(
      {
        args: {
          testArray: argPresets.numberArray("hello array"),
        },
      },
      ({ args }) => {
        args satisfies {
          testArray: number[];
        };
        return args;
      }
    );

    expect(example.help()).toMatchInlineSnapshot(`
      "usage:
        $ (cli) <testArray...>

      positional arguments:
        testArray    hello array
      "
    `);

    expect(example.parse([])).toMatchInlineSnapshot(`
      {
        "testArray": [],
      }
    `);

    expect(() =>
      example.parse(["a", "b", "1", "2"])
    ).toThrowErrorMatchingInlineSnapshot('"failed to parse <testArray...>"');

    expect(example.parse(["1", "2"])).toMatchInlineSnapshot(`
      {
        "testArray": [
          1,
          2,
        ],
      }
    `);
  });
});
