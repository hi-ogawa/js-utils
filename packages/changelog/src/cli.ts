import { execFile } from "node:child_process";
import fs from "node:fs";
import { resolve } from "node:path";
import process from "node:process";
import { parseArgs, promisify } from "node:util";
import { tinyassert } from "@hiogawa/utils";
import {
  type ParseArgsConfigExtra,
  generateParseArgsHelp,
} from "@hiogawa/utils-node";
import { version as packageVersion } from "../package.json";

// TODO:
// - bump version prompt?
// - workspace directory prompt?
// - git tag / commit prompt?

const parseArgsConfig = {
  $program: "changelog",
  $description: "Generate or update CHANGELOG.md based on git commits",
  $version: packageVersion,
  options: {
    from: {
      type: "string",
      $description: "(default: last commit modified CHANGELOG.md)",
    },
    to: {
      type: "string",
      default: "HEAD",
      $description: "(default: HEAD)",
    },
    dir: {
      type: "string",
      default: process.cwd(),
      $description: "(default: process.cwd())",
    },
    dry: {
      type: "boolean",
    },
    removeScope: {
      type: "boolean",
    },
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
  // TODO: options[key].default not inferred?
  tinyassert(args.dir);
  tinyassert(args.to);

  // find last commit modified changelog
  const changelogPath = resolve(args.dir, "CHANGELOG.md");
  if (!args.from && fs.existsSync(changelogPath)) {
    const { stdout } = await $(
      `git`,
      [`log`, `--pretty=%H`, `-1`, `${changelogPath}`],
      {
        cwd: args.dir,
      }
    );
    args.from = stdout.trim() || undefined;
  }

  // collect git logs
  const entries = await getGitlogs({
    from: args.from,
    to: args.to,
    dir: args.dir,
  });

  // format markdown
  let result = "## v?.?.?\n\n";
  for (const e of entries) {
    result += "- " + formatMessage(e.subject, args) + "\n";
  }
  result += "\n";

  // update changelog
  let header = `# Changelog\n\n`;
  let prev = "";
  if (fs.existsSync(changelogPath)) {
    header = await fs.promises.readFile(changelogPath, "utf-8");
    const m = header.match(/##/);
    if (m) {
      prev = header.slice(m.index);
      header = header.slice(0, m.index);
    }
  }
  const changelogContent = header + result + prev;
  if (args.dry) {
    console.log(changelogContent);
  } else {
    await fs.promises.writeFile(changelogPath, changelogContent);
  }
}

interface GitLogEntry {
  hash: string;
  subject: string;
}

async function getGitlogs(opts: {
  from?: string;
  to: string;
  dir: string;
}): Promise<GitLogEntry[]> {
  // https://github.com/unjs/changelogen/blob/42972f29e6d2c178fe27c8fad1e894858fab220a/src/git.ts#L62
  // https://git-scm.com/docs/pretty-formats
  const { stdout } = await $(
    "git",
    [
      `--no-pager`,
      `log`,
      [opts.from, opts.to].filter(Boolean).join("..."),
      `--pretty=---START---%H---SEP---%s`,
      `.`,
    ],
    {
      cwd: opts.dir,
    }
  );
  return stdout
    .split("---START---")
    .map((v) => v.trim())
    .filter(Boolean)
    .map((v) =>
      v
        .trim()
        .split("---SEP---")
        .map((v) => v.trim())
    )
    .map(([hash, subject]) => ({ hash, subject }));
}

function formatMessage(s: string, opts: { removeScope?: boolean }) {
  // format PR url
  //   (#184)  ⇒  ([#184](https://github.com/hi-ogawa/vite-plugins/pull/184))
  s = s.replace(
    /\(#(\d+)\)/,
    "([#$1](https://github.com/hi-ogawa/vite-plugins/pull/$1))"
  );
  // remove scope
  //   feat(react-server): ...  ⇒  feat: ...
  if (opts.removeScope) {
    s = s.replace(/^(\w+)(\([^)]*\))/, "$1");
  }
  return s;
}

const $ = promisify(execFile);

main();
