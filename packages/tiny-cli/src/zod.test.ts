import { beforeAll, describe, expect, it } from "vitest";
import { z } from "zod";
import { defineCommand } from "./typed";
import { setupZodArg, zodArgObject } from "./zod";

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
        $ PROGRAM [options] <files...>

      positional arguments:
        files    input files

      options:
        --fix    fix files in-place
      "
    `);
  });
});
