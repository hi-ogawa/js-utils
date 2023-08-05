import { beforeAll, describe, expect, it } from "vitest";
import { z } from "zod";
import { defineCommand } from "./typed";
import { setupZodExtendArg, zodArgs } from "./zod";

beforeAll(() => {
  return setupZodExtendArg(z);
});

describe(zodArgs, () => {
  it("basic", () => {
    const example = defineCommand(
      {
        args: zodArgs(
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
        $ PROGRAM [options] <files...>

      positional arguments:
        files    input files

      options:
        --fix    fix files in-place
      "
    `);
  });
});
