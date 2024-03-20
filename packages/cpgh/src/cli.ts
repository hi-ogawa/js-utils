import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { name, version } from "../package.json";

const HELP = `\
${name}@${version}

Usage:
  npx cpgh https://github.com/<user>/<repo>/tree/<branch>/<subdir> <outdir>

Options:
  --force      Overwrite <outdir> if it exists
  --verbose    Show logs from git command
  -h, --help   Show help

Examples:
  npx cpgh https://github.com/vitest-dev/vitest/tree/main/examples/basic my-project
`;

let verbose = false;

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("-h") || args.includes("--help") || args.length === 0) {
    console.log(HELP);
    return;
  }
  const force = args.includes("--force");
  if (force) {
    args.splice(args.indexOf("--force"), 1);
  }
  verbose = args.includes("--verbose");
  if (verbose) {
    args.splice(args.indexOf("--verbose"), 1);
  }
  if (args.length !== 2) {
    console.log(HELP);
    process.exit(1);
  }

  // TODO: decode url?
  let [url, outDir] = args;
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

  // check --force
  outDir = path.resolve(outDir);
  if (fs.existsSync(outDir)) {
    if (!force) {
      console.log(
        `⊳ '${outDir}' already exists. --force is required to overwrite.`
      );
      process.exit(1);
    }
    console.log(`⊳ '${outDir}' already exits. Continuing to overwrite...`);
    await fs.promises.rm(outDir, { recursive: true, force: true });
  }

  const tmpDir = path.join(outDir, ".tmp-cpgh");
  await fs.promises.mkdir(tmpDir, { recursive: true });

  console.log("⊳ Running git ...");
  if (subDir) {
    // https://stackoverflow.com/a/60729017
    await $(
      "git",
      "clone",
      "--sparse",
      "--no-checkout",
      "--filter=tree:0",
      "--depth=1",
      "--single-branch",
      `--branch`,
      branch,
      `https://github.com/${user}/${repo}`,
      tmpDir
    );
    await $("git", "-C", tmpDir, "sparse-checkout", "add", subDir);
    await $("git", "-C", tmpDir, "checkout");
  } else {
    await $(
      "git",
      "clone",
      "--depth=1",
      "--single-branch",
      `--branch`,
      branch,
      `https://github.com/${user}/${repo}`,
      tmpDir
    );
  }

  // copy from tmp dir
  await fs.promises.cp(path.join(tmpDir, subDir), outDir, { recursive: true });
  await fs.promises.rm(tmpDir, { recursive: true, force: true });
  console.log(`⊳ Successfully copied to '${outDir}'`);
}

function $(...args: string[]) {
  console.log("▹▹ $ " + args.join(" "));
  return new Promise<void>((resolve, reject) => {
    const proc = spawn(args[0], args.slice(1), {
      stdio: verbose ? "inherit" : "ignore",
    });
    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error("Command failed with exit code: " + code));
      }
    });
    proc.on("error", (e) => {
      reject(e);
    });
  });
}

main();
