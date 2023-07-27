import { exec } from "node:child_process";
import { promisify } from "node:util";
import { tinyassert, zip } from "@hiogawa/utils";
import process from "node:process";

const execPromise = promisify(exec);

async function $(strings: TemplateStringsArray, ...params: string[]) {
  const command = [zip(strings, params), strings.at(-1)].flat(2).join("");
  console.log("$", command);
  // TODO: get stderr also when process failed
  const result = await execPromise(command);
  if (result.stderr) {
    console.error(result.stderr);
  }
  return result.stdout;
}

// parse
// https://github.com/(owner)/(repo)/tree/(ref)/(...path)
// https://github.com/(owner)/(repo)/blob/(ref)/(...path)
function parseGithubUrlPath(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  const [owner, repo, type, ref, ...restParts] = parts;
  return {
    owner,
    repo,
    type,
    ref,
    path: restParts.join("/"),
  };
}
