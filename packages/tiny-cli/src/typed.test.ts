import { describe, expect, it } from "vitest";
import { z } from "zod";
import { defineArg, defineCommand } from "./typed";

describe(defineCommand, () => {
  it("basic", () => {
    const example = defineCommand(
      {
        arg: defineArg(z.string().parse, {
          positional: true,
          describe: "this is required arg",
        }),
        argOpt: defineArg(z.string().optional().parse, {
          positional: true,
          describe: "this is not required",
        }),
        num: defineArg(z.coerce.number().parse),
        numOpt: defineArg(z.coerce.number().optional().parse),
        numOptDefault: defineArg(z.coerce.number().default(10).parse, {
          describe: "optional and default 10",
        }),
        str: defineArg(z.string().parse),
        boolFlag: defineArg(z.coerce.boolean().default(false).parse, {
          flag: true,
          describe: "some toggle",
        }),
      },
      ({ args }) => {
        args satisfies {
          arg: string;
          argOpt?: string;
          num: number;
          numOpt?: number;
          numOptDefault: number;
          str: string;
          boolFlag: boolean;
        };
        return args;
      }
    );

    expect(example.help()).toMatchInlineSnapshot(`
      "usage:
        program [options] <arg> <argOpt>

      positional arguments:
        arg       this is required arg
        argOpt    this is not required

      options:
        --num=...
        --numOpt=...
        --numOptDefault=...    optional and default 10
        --str=...
        --boolFlag             some toggle
      "
    `);

    expect(example.parse(["x", "--boolFlag", "--num", "123", "--str", "hey"]))
      .toMatchInlineSnapshot(`
        {
          "arg": "x",
          "boolFlag": true,
          "num": 123,
          "numOpt": undefined,
          "numOptDefault": 10,
          "str": "hey",
        }
      `);

    expect(() =>
      example.parse(["x", "y", "z"])
    ).toThrowErrorMatchingInlineSnapshot('"too many arguments: x, y, z"');

    expect(() =>
      example.parse(["x", "--hehe", "he", "--foo"])
    ).toThrowErrorMatchingInlineSnapshot('"unknown options: --hehe, --foo"');

    expect(() =>
      example.parse(["x", "--hehe", "--hehe"])
    ).toThrowErrorMatchingInlineSnapshot('"duplicate options: --hehe"');

    expect(() => example.parse(["x"])).toThrowErrorMatchingInlineSnapshot(
      '"failed to parse --num"'
    );
  });

  describe("variadic", () => {
    it("basic", () => {
      const example = defineCommand(
        {
          files: defineArg(z.string().array().parse, {
            positional: true,
            variadic: true,
            describe: "input files",
          }),
          fix: defineArg(z.coerce.boolean().default(false).parse, {
            flag: true,
            describe: "fix files in-place",
          }),
        },
        ({ args }) => {
          args satisfies {
            files: string[];
            fix: boolean;
          };
          return args;
        }
      );

      expect(example.help()).toMatchInlineSnapshot(`
        "usage:
          program [options] <files...>

        positional arguments:
          files    input files

        options:
          --fix    fix files in-place
        "
      `);

      expect(example.parse([])).toMatchInlineSnapshot(`
        {
          "files": [],
          "fix": false,
        }
      `);
      expect(example.parse(["x", "--fix", "y", "z"])).toMatchInlineSnapshot(`
        {
          "files": [
            "x",
            "y",
            "z",
          ],
          "fix": true,
        }
      `);
    });

    it("unsupported", () => {
      const example = () =>
        defineCommand(
          {
            first: defineArg(z.string().parse, {
              positional: true,
            }),
            rest: defineArg(z.string().array().parse, {
              positional: true,
              variadic: true,
            }),
          },
          ({ args }) => {
            args satisfies {
              first: string;
              rest: string[];
            };
            return args;
          }
        );
      expect(() => example()).toThrowErrorMatchingInlineSnapshot(
        '"variadic command with multiple positionals are unsupported"'
      );
    });
  });
});