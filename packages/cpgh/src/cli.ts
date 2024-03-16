import { exec } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { promisify } from "node:util";
import { name, version } from "../package.json";

const execp = promisify(exec);

const HELP = `\
${name}@${version}

Usage:
  npx cpgh https://github.com/<user>/<repo>/tree/<branch>/<subdir> <outdir>

Examples:
  npx cpgh https://github.com/vitest-dev/vitest/tree/main/examples/basic my-app
  npx cpgh https://github.com/vitest-dev/vitest/tree/this/is/branch[/]examples/basic my-app
`;

async function main() {
  const args = process.argv.slice(2);
  if (args.length !== 2) {
    console.log(HELP);
    if (args.includes("-h") || args.includes("--help") || args.length === 0) {
      return;
    }
    process.exit(1);
  }

  // TODO: decode url?
  const [url, outDir] = args;
  const match = url.match(
    new RegExp(String.raw`^https://github.com/([^/]+)/([^/]+)/tree/(.*)$`)
  );
  if (!match) {
    console.log(HELP);
    process.exit(1);
  }
  const [, user, repo, rest] = match;
  let branch: string;
  let subDir: string;
  if (rest.includes("[/]")) {
    [branch, subDir] = rest.split("[/]");
  } else {
    const splits = rest.split("/");
    branch = splits[0];
    subDir = splits.slice(1).join("/");
  }
  subDir ||= "/";

  // TODO: --force
  if (fs.existsSync(outDir)) {
    console.log(`'${outDir}' already exists. use --force to overwrite it.`);
    process.exit(1);
  }

  const tmpDir = path.join(outDir, ".tmp-cpgh");
  await fs.promises.mkdir(tmpDir, { recursive: true });
  await execp(
    `git clone --sparse --no-checkout --filter=tree:0 --depth 1 https://github.com/${user}/${repo} --branch ${branch} ${tmpDir}`
  );
  await execp(`git -C ${tmpDir} sparse-checkout add ${subDir}`);
  await execp(`git -C ${tmpDir} checkout`);
  await fs.promises.cp(path.join(tmpDir, subDir), outDir, { recursive: true });
  await fs.promises.rm(tmpDir, { recursive: true, force: true });
}

main();
