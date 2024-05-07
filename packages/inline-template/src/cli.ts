import fs from "node:fs";
import process from "node:process";
import { TinyCliCommand, arg, tinyCliMain } from "@hiogawa/tiny-cli";
import { InlineTemplateProcessor } from ".";
import { version as packageVersion } from "../package.json";

// TODO: "--check" mode to throw error if diff?

const cli = new TinyCliCommand(
  {
    program: "inline-template",
    version: packageVersion,
    description: "Expand inline template",
    args: {
      file: arg.string("Input file", { positional: true }),
      dry: arg.boolean("Print instead of updating in-place"),
      cwd: arg.string("Working directory to execute shell code interpolation", {
        default: process.cwd(),
      }),
    },
  },
  async ({ args }) => {
    const input = await fs.promises.readFile(args.file, "utf-8");
    const processor = new InlineTemplateProcessor({
      spawn: { cwd: args.cwd },
    });
    const output = await processor.process(input);
    if (args.dry) {
      console.log(output);
    } else {
      await fs.promises.writeFile(args.file, output);
    }
  }
);

tinyCliMain(cli);
