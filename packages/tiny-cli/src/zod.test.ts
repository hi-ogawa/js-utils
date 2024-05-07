import { describe, expect, expectTypeOf, it } from "vitest";
import { z } from "zod";
import { TinyCliCommand } from "./cli";
import { zArg } from "./zod";

describe(zArg, () => {
  it("basic", () => {
    const cli = new TinyCliCommand(
      {
        args: {
          files: zArg(z.string().array(), {
            positional: true,
            variadic: true,
            description: "input files",
          }),
          fix: zArg(z.coerce.boolean(), {
            flag: true,
            description: "fix files in-place",
          }),
          mode: z.coerce.number().default(123).describe("some setting"),
        },
      },
      ({ args }) => {
        expectTypeOf(args).toEqualTypeOf<{
          files: string[];
          fix: boolean;
          mode: number;
        }>();
        return args;
      },
    );

    expect(cli.help()).toMatchInlineSnapshot(`
      "example-cli

      Usage:
        $ example-cli [options] <files...>

      Positional arguments:
        files    input files

      Options:
        --fix         fix files in-place
        --mode=...    some setting
      "
    `);

    expect(cli.parse(["hey"])).toMatchInlineSnapshot(`
      {
        "files": [
          "hey",
        ],
        "fix": false,
        "mode": 123,
      }
    `);
  });
});
