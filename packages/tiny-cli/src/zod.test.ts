import { beforeAll, describe, expect, it } from "vitest";
import { z } from "zod";
import { defineCommand } from "./typed";
import { setupZodArg, zArg, zodArgObject } from "./zod";

beforeAll(() => {
  return setupZodArg(z);
});

describe(zodArgObject, () => {
  it("basic", () => {
    const example = defineCommand(
      {
        args: zodArgObject(
          z.object({
            files: z
              .string()
              .array()
              .describe("input files")
              .asArg({ type: "positional", variadic: true }),
            fix: z.coerce
              .boolean()
              .describe("fix files in-place")
              .asArg({ type: "flag" }),
          })
        ),
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
        $ (cli) [options] <files...>

      positional arguments:
        files    input files

      options:
        --fix    fix files in-place
      "
    `);
  });
});

describe(zArg, () => {
  it("basic", () => {
    const example = defineCommand(
      {
        args: {
          files: zArg(z.string().array(), {
            type: "positional",
            variadic: true,
            description: "input files",
          }),
          fix: zArg(z.coerce.boolean(), {
            type: "flag",
            description: "fix files in-place",
          }),
          // TODO: could this fail in some strict tsc mode?
          mode: z.coerce.number().default(123).describe("some setting"),
        },
      },
      ({ args }) => {
        args satisfies {
          files: string[];
          fix: boolean;
        };
        args.files;
        return args;
      }
    );

    expect(example.help()).toMatchInlineSnapshot(`
      "usage:
        $ (cli) [options] <files...>

      positional arguments:
        files    input files

      options:
        --mode=...    some setting
        --fix         fix files in-place
      "
    `);
  });
});
