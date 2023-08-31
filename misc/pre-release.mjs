import process from "node:process";
import { tinyassert } from "@hiogawa/utils";
import { $, promptQuestion } from "@hiogawa/utils-node";
import fs from "node:fs";

// usage:
//   node misc/pre-release.mjs packages/utils-node

$._.verbose = true;
const $$ = $.new({ stdio: "inherit" });

async function main() {
  const packageDir = process.argv[2];
  tinyassert(packageDir, "missing 'packageDir'");
  const packageJsonPath = `${packageDir}/package.json`;

  // require no diff to start
  const gitStatus = await $`git status --porcelain`;
  if (gitStatus) {
    console.log(gitStatus);
    const input = await promptQuestion(
      "* proceed regardless of dirty 'git status'? (y/n) "
    );
    if (input !== "y") process.exit(1);
  }

  // update version
  /** @type {{ version: string }} */
  const pakcageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
  pakcageJson.version = getNextVersion(pakcageJson.version);
  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(pakcageJson, null, 2) + "\n"
  );

  // push
  await $$`git diff ${packageJsonPath}`;
  const input = await promptQuestion("* proceed to push changes? (y/n) ");
  if (input !== "y") process.exit(1);

  await $$`git add ${packageJsonPath}`;
  await $$`git commit -m 'chore: pre release (${pakcageJson.name}@${pakcageJson.version})'`;
  await $$`git push origin HEAD`;
}

/**
 * @param {string} version
 */
function getNextVersion(version) {
  const vs = version.match(/(\d+).(\d+).(\d+)(?:-pre.(\d+))?/).slice(1);
  if (vs[3]) {
    vs[3] = Number(vs[3]) + 1;
  } else {
    vs[2] = Number(vs[2]) + 1;
    vs[3] = 0;
  }
  return vs.slice(0, -1).join(".") + "-pre." + vs[3];
}

main();
