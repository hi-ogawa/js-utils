import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { arg } from "./presets";
import { defineCommand } from "./typed";

describe(defineCommand, () => {
  it("basic", () => {
    const autoHelpLog = vi.fn();
    const example = defineCommand(
      {
        program: "basic.js",
        description: "This is a command line program to do something.",
        autoHelp: true,
        autoHelpLog,
        args: {
          arg: arg.string("this is required arg", { positional: true }),
          argOpt: arg.string("this is not required", {
            positional: true,
            optional: true,
          }),
          num: arg.number(),
          numOpt: arg.number("", { optional: true }),
          numOptDefault: arg.number("optional and default 10", { default: 10 }),
          str: arg.string(),
          boolFlag: arg.boolean("some toggle"),
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
        $ basic.js [options] <arg> <argOpt>

      This is a command line program to do something.

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
          "argOpt": undefined,
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

    expect(example.parse(["--help"])).toMatchInlineSnapshot("undefined");
    expect(autoHelpLog.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "usage:
        $ basic.js [options] <arg> <argOpt>

      This is a command line program to do something.

      positional arguments:
        arg       this is required arg
        argOpt    this is not required

      options:
        --num=...
        --numOpt=...
        --numOptDefault=...    optional and default 10
        --str=...
        --boolFlag             some toggle
      ",
        ],
      ]
    `);
  });

  describe("variadic", () => {
    it("basic", () => {
      const example = defineCommand(
        {
          args: {
            files: {
              positional: true,
              variadic: true,
              description: "input files",
              parse: z.string().array().parse,
            },
            fix: {
              flag: true,
              description: "fix files in-place",
              parse: z.coerce.boolean().parse,
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
          $ example-cli [options] <files...>

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
                positional: true,
                parse: z.string().parse,
              },
              rest: {
                positional: true,
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

  it("positional", () => {
    const command = defineCommand(
      {
        args: {
          arg: {
            positional: true,
            parse: z.string().parse,
          },
        },
      },
      ({ args }) => args
    );

    expect(() => command.parse([])).toThrowErrorMatchingInlineSnapshot(
      '"failed to parse <arg>"'
    );
  });

  it("version", () => {
    const autoHelpLog = vi.fn();
    const command = defineCommand(
      {
        version: "1.2.3",
        autoHelpLog,
        args: {
          infile: arg.string(),
        },
      },
      ({ args }) => args
    );
    command.parse(["--version"]);
    expect(autoHelpLog.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "1.2.3",
        ],
      ]
    `);
  });
});
