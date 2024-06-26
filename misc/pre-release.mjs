import fs from "node:fs";
import process from "node:process";
import { colors, formatError, tinyassert } from "@hiogawa/utils";
import { $, promptAutocomplete, promptQuestion } from "@hiogawa/utils-node";

// usage:
//   node misc/pre-release.mjs packages/utils-node

$._.verbose = true;
const $$ = $.new({ stdio: "inherit" });

async function main() {
  const cwd = process.cwd();
  const pnpmLs = await $`pnpm ls --filter '*' --depth -1 --json`;
  const packageDirs = JSON.parse(pnpmLs)
    .filter((p) => !p.private)
    .map((p) => p.path.slice(cwd.length + 1));

  const choice = await promptAutocomplete({
    message: "Select package directory",
    suggest: (input) => {
      return packageDirs.filter((p) => p.includes(input));
    },
  });
  if (!choice.value) {
    process.exitCode = 1;
    return;
  }
  const packageJsonPath = `${choice.value}/package.json`;
  tinyassert(
    fs.existsSync(packageJsonPath),
    "invalid package: " + packageJsonPath
  );

  // require no diff to start
  const gitStatus = await $`git status --porcelain`;
  if (gitStatus) {
    console.log(gitStatus);
    const input = await promptQuestion(
      "* proceed regardless of dirty 'git status'? (Y/n) "
    );
    if (!["", "y"].includes(input)) process.exit(1);
  }

  // update version
  const pakcageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
  const nextVersion = getNextVersion(pakcageJson.version);
  console.log("* version change");
  console.log(colors.red(`- ${pakcageJson.version}`));
  console.log(colors.green(`+ ${nextVersion}`));
  const input = await promptQuestion("* proceed to push changes? (y/n) ");
  if (!["", "y"].includes(input)) process.exit(1);

  // write file
  pakcageJson.version = nextVersion;
  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(pakcageJson, null, 2) + "\n"
  );

  // push
  await $$`git add ${packageJsonPath}`;
  await $$`git commit -m 'chore: pre release (${pakcageJson.name}@${pakcageJson.version})'`;
  await $$`git push origin HEAD`;
}

function getNextVersion(
  /** @type {string} */
  version
) {
  const vs = version.match(/(\d+).(\d+).(\d+)(?:-pre.(\d+))?/).slice(1);
  if (vs[3]) {
    vs[3] = Number(vs[3]) + 1;
  } else {
    vs[2] = Number(vs[2]) + 1;
    vs[3] = 0;
  }
  return vs.slice(0, -1).join(".") + "-pre." + vs[3];
}

main().catch((e) => console.error(formatError(e)));
