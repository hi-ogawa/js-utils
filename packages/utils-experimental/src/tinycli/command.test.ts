import { describe, expect, it } from "vitest";
import { z } from "zod";
import { createCommand, defineArg } from "./command";

describe(createCommand, () => {
  it("basic", () => {
    const example = createCommand(
      {
        arg: defineArg(z.string().parse, {
          positional: true,
        }),
        argOpt: defineArg(z.string().optional().parse, {
          positional: true,
        }),
        num: defineArg(z.coerce.number().parse),
        numOpt: defineArg(z.coerce.number().optional().parse),
        numOptDefault: defineArg(z.coerce.number().default(10).parse),
        str: defineArg(z.string().parse),
        boolFlagOpt: defineArg(z.coerce.boolean().default(false).parse, {
          flag: true,
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
          boolFlagOpt: boolean;
        };
        return args;
      }
    );

    expect(example.help()).toMatchInlineSnapshot(`
      "Usage:
        PROGRAM [options] <arg> <argOpt>

      Options
        --num=...
        --numOpt=...
        --numOptDefault=...
        --str=...
        --boolFlagOpt
      "
    `);

    expect(example.parseAndRun(["x", "--num", "123", "--str", "hey"]))
      .toMatchInlineSnapshot(`
        {
          "arg": "x",
          "boolFlagOpt": false,
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
