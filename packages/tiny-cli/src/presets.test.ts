import { describe, expect, it } from "vitest";
import { TinyCliCommand } from "./cli";
import { arg } from "./presets";

describe("presets", () => {
  it("basic", () => {
    const cli = new TinyCliCommand(
      {
        args: {
          positionalString: arg.string("", { positional: true }),
          positionalNumberDefault: arg.number("", {
            positional: true,
            default: 123,
          }),
          positionalNumberOptional: arg.number("", {
            positional: true,
            optional: true,
          }),
          testBoolean: arg.boolean("hello boolean"),
          testString: arg.string("hello string"),
          testStringOpt: arg.string("hello optional string", {
            optional: true,
          }),
          testStringOptDefault: arg.string("hello default string", {
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

    expect(cli.help()).toMatchInlineSnapshot(`
      "example-cli

      Usage:
        $ example-cli [options] <positionalString> <positionalNumberDefault> <positionalNumberOptional>

      Positional arguments:
        positionalString
        positionalNumberDefault
        positionalNumberOptional

      Options:
        --testBoolean                 hello boolean
        --testString=...              hello string
        --testStringOpt=...           hello optional string
        --testStringOptDefault=...    hello default string
      "
    `);

    expect(() => cli.parse([])).toThrowErrorMatchingInlineSnapshot(
      '"failed to parse <positionalString>"'
    );

    expect(() =>
      cli.parse(["hello", "not-a-number"])
    ).toThrowErrorMatchingInlineSnapshot(
      '"failed to parse <positionalNumberDefault>"'
    );

    expect(() =>
      cli.parse(["hello", "123", "not-a-number"])
    ).toThrowErrorMatchingInlineSnapshot(
      '"failed to parse <positionalNumberOptional>"'
    );

    expect(cli.parse(["hello", "123", "456", "--testString", "hey"]))
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

    expect(cli.parse(["--testString", "hey", "--testBoolean", "hello"]))
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
    const cli = new TinyCliCommand(
      {
        args: {
          testArray: arg.stringArray("hello array"),
        },
      },
      ({ args }) => {
        args satisfies {
          testArray: string[];
        };
        return args;
      }
    );

    expect(cli.help()).toMatchInlineSnapshot(`
      "example-cli

      Usage:
        $ example-cli <testArray...>

      Positional arguments:
        testArray    hello array
      "
    `);

    expect(cli.parse([])).toMatchInlineSnapshot(`
        {
          "testArray": [],
        }
      `);

    expect(cli.parse(["a", "b", "1", "2"])).toMatchInlineSnapshot(`
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
    const cli = new TinyCliCommand(
      {
        args: {
          testArray: arg.numberArray("hello array"),
        },
      },
      ({ args }) => {
        args satisfies {
          testArray: number[];
        };
        return args;
      }
    );

    expect(cli.help()).toMatchInlineSnapshot(`
      "example-cli

      Usage:
        $ example-cli <testArray...>

      Positional arguments:
        testArray    hello array
      "
    `);

    expect(cli.parse([])).toMatchInlineSnapshot(`
      {
        "testArray": [],
      }
    `);

    expect(() =>
      cli.parse(["a", "b", "1", "2"])
    ).toThrowErrorMatchingInlineSnapshot('"failed to parse <testArray...>"');

    expect(cli.parse(["1", "2"])).toMatchInlineSnapshot(`
      {
        "testArray": [
          1,
          2,
        ],
      }
    `);
  });
});
