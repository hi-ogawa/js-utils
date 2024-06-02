import { execFile } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { parseArgs, promisify } from "node:util";
import {
  type ParseArgsConfigExtra,
  generateParseArgsHelp,
} from "@hiogawa/utils-node";
import { version as packageVersion } from "../package.json";

const parseArgsConfig = {
  $program: "binstall",
  $description: `\
Examples:
  npx @hiogawa/binstall https://github.com/cli/cli
  npx @hiogawa/binstall https://github.com/cli/cli/releases/tag/v2.50.0
  npx @hiogawa/binstall https://github.com/cli/cli/releases/download/v2.50.0/gh_2.50.0_linux_amd64.tar.gz
`,
  $version: packageVersion,
  options: {
    help: {
      type: "boolean",
      short: "h",
    },
  },
} satisfies ParseArgsConfigExtra;

async function main() {
  const { values: args } = parseArgs(parseArgsConfig);
  if (args.help) {
    console.log(generateParseArgsHelp(parseArgsConfig));
    process.exit(0);
  }

  $;
  fs;
  path;
  // - fetch github release
  // - choose a file
  // - download a file
  // - (if compressed, decompress a file and choose a file again)
  // - move a file to `~/.local/bin` and chmod
}

const $ = promisify(execFile);

main();
