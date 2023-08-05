import { describe, expect, it } from "vitest";
import { z } from "zod";
import { defineCommand } from "./typed";

describe(defineCommand, () => {
  it("basic", () => {
    const example = defineCommand(
      {
        args: {
          arg: {
            type: "positional",
            parse: z.string().parse,
            describe: "this is required arg",
          },
          argOpt: {
            type: "positional",
            parse: z.string().optional().parse,
            describe: "this is not required",
          },
          num: { parse: z.coerce.number().parse },
          numOpt: { parse: z.coerce.number().optional().parse },
          numOptDefault: {
            parse: z.coerce.number().default(10).parse,
            describe: "optional and default 10",
          },
          str: { parse: z.string().parse },
          boolFlag: {
            type: "flag",
            parse: z.coerce.boolean().default(false).parse,
            describe: "some toggle",
          },
        },
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
        $ program [options] <arg> <argOpt>

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
          args: {
            files: {
              type: "positional",
              variadic: true,
              describe: "input files",
              parse: z.string().array().parse,
            },
            fix: {
              type: "flag",
              describe: "fix files in-place",
              parse: z.coerce.boolean().default(false).parse,
            },
          },
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
          $ program [options] <files...>

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
            args: {
              first: {
                type: "positional",
                parse: z.string().parse,
              },
              rest: {
                type: "positional",
                variadic: true,
                parse: z.string().array().parse,
              },
            },
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
