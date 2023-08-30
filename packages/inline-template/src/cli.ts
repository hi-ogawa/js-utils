import fs from "node:fs";
import process from "node:process";
import { TinyCliCommand, arg, tinyCliMain } from "@hiogawa/tiny-cli";
import { processInlineTemplate } from ".";
import { version as packageVersion } from "../package.json";

const cli = new TinyCliCommand(
  {
    program: "inline-template",
    version: packageVersion,
    description: "Expand inline template",
    args: {
      file: arg.string("Input file", { positional: true }),
      inplace: arg.boolean("Update file in-place"),
      cwd: arg.string("Working directory to execute shell code interpolation", {
        default: process.cwd(),
      }),
    },
  },
  async ({ args }) => {
    const input = await fs.promises.readFile(args.file, "utf-8");
    const output = processInlineTemplate(input, { cwd: args.cwd });
    if (args.inplace) {
      await fs.promises.writeFile(args.file, output);
    } else {
      console.log(output);
    }
  }
);

tinyCliMain(cli);
