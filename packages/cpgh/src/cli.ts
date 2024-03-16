import fs from "node:fs";
import process from "node:process";
import { name, version } from "../package.json";

const HELP = `\
${name}@${version}

Usage:
  npx cpgh https://github.com/<user>/<repo>/tree/<commit>/<subdir> <outdir>

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
    return 1;
  }

  // TODO: decode url?
  const [url, outdir] = args;
  const match = url.match(
    new RegExp(String.raw`^https://github.com/([^/]+)/([^/]+)/tree/(.*)$`)
  );
  if (!match) {
    console.log(HELP);
    return 1;
  }
  const [, user, repo, rest] = match;
  let commit = rest;
  let subdir = "";
  if (rest.includes("[/]")) {
    [commit, subdir] = rest.split("[/]");
  } else {
    const splits = rest.split("/");
    commit = splits[0];
    subdir = splits.slice(1).join("/");
  }

  // TODO
  console.log({
    user,
    repo,
    commit,
    subdir,
    outdir,
  });
  fs;

  return;
}

main();
