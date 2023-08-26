import process from "node:process";
import { TinyCliCommand, arg, tinyCliMain } from "@hiogawa/tiny-cli";
import { version } from "../package.json";
import { run } from "./runner";

const command = new TinyCliCommand(
  {
    program: "icheck-ts",
    version,
    description: "Lint import and export usages",
    args: {
      files: arg.stringArray("typescript files to lint"),
      verbose: arg.boolean("versobe output"),
    },
  },
  ({ args }) => {
    const result = run(args.files);

    if (args.verbose) {
      console.log(new Map(result.exportUsages));
    }

    const unused = [...result.exportUsages]
      .map(([k, vs]) => [k, vs.filter((v) => !v.used)] as const)
      .filter(([_k, vs]) => vs.length > 0);

    if (unused.length > 0) {
      console.log("* found unused exports");
      for (const [file, entries] of unused) {
        for (const e of entries) {
          console.log(`${file} - ${e.name}`);
        }
      }
      process.exit(1);
    }
  }
);

tinyCliMain(command);
