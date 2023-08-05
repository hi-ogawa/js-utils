import { describe, expect, it } from "vitest";
import { z } from "zod";
import { createCommand, defineArg } from "./command";

describe(createCommand, () => {
  it("basic", () => {
    const example = createCommand(
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

    expect(
      example.parseAndRun(["x", "--boolFlag", "--num", "123", "--str", "hey"])
    ).toMatchInlineSnapshot(`
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
      example.parseAndRun(["x", "y", "z"])
    ).toThrowErrorMatchingInlineSnapshot('"too many arguments: x, y, z"');

    expect(() =>
      example.parseAndRun(["x", "--hehe", "he", "--foo"])
    ).toThrowErrorMatchingInlineSnapshot('"unknown options: hehe, foo"');

    expect(() =>
      example.parseAndRun(["x", "--hehe", "--hehe"])
    ).toThrowErrorMatchingInlineSnapshot('"duplicate options: hehe"');

    expect(() => example.parseAndRun(["x"]))
      .toThrowErrorMatchingInlineSnapshot(`
      "[
        {
          \\"code\\": \\"invalid_type\\",
          \\"expected\\": \\"number\\",
          \\"received\\": \\"nan\\",
          \\"path\\": [],
          \\"message\\": \\"Expected number, received nan\\"
        }
      ]"
    `);
  });
});
