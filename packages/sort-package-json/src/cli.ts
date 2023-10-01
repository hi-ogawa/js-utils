import fs from "node:fs";
import process from "node:process";
import { name, version } from "../package.json";
import RULE from "./scrape-output.json";

const RULE_MAP = Object.fromEntries(
  Object.entries(RULE).map(([k, v]) => [v, Number(k)])
);

const HELP = `\
${name}@${version}

Usage:
  sort-package-json [package.json files...]

Examples:
  # Sort package.json files in pnpm workspace
  sort-package-json $(pnpm ls --filter '*' --depth -1 --json | jq -r '.[] | .path' | xargs -I '{}' echo '{}/package.json')
`;

function main() {
  const infiles = process.argv.slice(2);
  if (
    infiles.includes("-h") ||
    infiles.includes("--help") ||
    infiles.length === 0
  ) {
    console.log(HELP);
    return;
  }
  for (const infile of infiles) {
    const fixed = sortPackageJson(infile);
    console.log(fixed ? "[fixed]" : "[no-change]", infile);
  }
}

function sortPackageJson(infile: string): boolean {
  const original = JSON.parse(fs.readFileSync(infile, "utf-8"));
  const sorted = Object.fromEntries(
    Object.entries(original).sort(
      ([k1], [k2]) => (RULE_MAP[k1] ?? 1e8) - (RULE_MAP[k2] ?? 1e8)
    )
  );
  if (
    JSON.stringify(Object.keys(original)) ===
    JSON.stringify(Object.keys(sorted))
  ) {
    return false;
  }
  fs.writeFileSync(infile, JSON.stringify(sorted, null, 2) + "\n");
  return true;
}

main();
