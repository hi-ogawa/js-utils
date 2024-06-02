import { execFile } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { parseArgs, promisify } from "node:util";
import os from "node:os";
import {
  type ParseArgsConfigExtra,
  generateParseArgsHelp,
  promptQuestion,
  promptAutocomplete,
} from "@hiogawa/utils-node";
import { tinyassert } from "@hiogawa/utils"
import { version as packageVersion } from "../package.json";
import { Readable } from "node:stream";

const parseArgsConfig = {
  $program: "bin",
  $command: "bin <url>",
  $description: `\
Examples:
  npx @hiogawa/bin https://github.com/cli/cli
  npx @hiogawa/bin https://github.com/cli/cli/releases/tag/v2.50.0
  npx @hiogawa/bin https://github.com/cli/cli/releases/download/v2.50.0/gh_2.50.0_linux_amd64.tar.gz
`,
  $version: packageVersion,
  allowPositionals: true,
  options: {
    help: {
      type: "boolean",
      short: "h",
    },
  },
} satisfies ParseArgsConfigExtra;

// cf.
// https://github.com/hi-ogawa/misc/blob/main/scripts/bin-script.sh
// https://github.com/asdf-vm/asdf-plugin-template

async function main() {
  const args = parseArgs(parseArgsConfig);
  if (args.values.help || args.positionals.length !== 1) {
    console.log(generateParseArgsHelp(parseArgsConfig));
    process.exit(0);
  }

  let url = args.positionals[0];
  // https://github.com/cli/cli/releases/download/v2.50.0/gh_2.50.0_linux_amd64.tar.gz

  if (url.endsWith(".tar.gz")) {
    const tmpDir = path.join(os.tmpdir(), "binstall-" + url.replace(/[^a-zA-Z0-9]/g, "_"));
    await fs.promises.rm(tmpDir, { recursive: true, force: true });
    await fs.promises.mkdir(tmpDir, { recursive: true });
    const res = await fetch(url);
    tinyassert(res.ok);
    tinyassert(res.body);
    const downloadDest = path.join(tmpDir, path.basename(url));
    await fs.promises.writeFile(downloadDest, Readable.fromWeb(res.body as any));
  }

  function selectTarGz(file: string) {
    os.tmpdir();
  }

  if (1) {
    return;
  }

  if (!url.includes("/releases/")) {
    url += "/releases/latest";
  }

  // owner, repo
  fetch(url);

  // prepare ~/.local/bin
  const binDir = path.join(os.homedir(), ".local/bin");
  await fs.promises.mkdir(binDir, { recursive: true });

  fetch;

  // cf.
  // https://github.com/hi-ogawa/misc/blob/main/scripts/bin-script.sh
  // https://github.com/asdf-vm/asdf-plugin-template
  // - fetch github release
  // - choose a file
  // - download a file
  // - (if compressed, decompress a file and choose a file again)
  // - move a file to `~/.local/bin` and chmod

  // https://github.com/cli/cli/releases/latest
  // https://github.com/cli/cli/releases/tag/v2.50.0

  promptAutocomplete;

  $;
  fs;
  path;
  listReleaseFiles;
  // findLatestStable;
}

function listReleaseFiles() {
}

function findReleaseUrl() {
  // npx @hiogawa/bin https://github.com/cli/cli
}

const $ = promisify(execFile);

main();
