import { type ParseArgsConfig, parseArgs } from "node:util";
import { range } from "@hiogawa/utils";

export interface ParseArgsConfigExtra extends ParseArgsConfig {
  $program?: string;
  $command?: string;
  $version?: string;
  $description?: string;
  options?: {
    [longOption: string]: NonNullable<ParseArgsConfig["options"]>[string] & {
      $description?: string;
      $argument?: string;
    };
  };
}

export function runParseArgs<T extends ParseArgsConfigExtra, U>(
  config: T,
  action: (parsed: ReturnType<typeof parseArgs<T>>) => U
) {
  (config.options ??= {})["help"] = {
    type: "boolean",
    short: "-h",
    $description: "",
  };
  const parsed = parseArgs(config);
  if ("help" in parsed.values && parsed.values["help"]) {
    console.log(generateParseArgsHelp(config));
    return;
  }
  return action(parsed);
}

export function generateParseArgsHelp(config: ParseArgsConfigExtra) {
  const { $program = "my-cli", $command, $version, $description } = config;
  let output = `\
${[$program, $version].filter(Boolean).join("/")}

Usage:
  $ ${$command ?? `${$program} [options]`}

`;
  if ($description) {
    output += $description + "\n\n";
  }
  if (config.options) {
    const entries = Object.entries(config.options);
    const rows = entries.map(([k, v]) => [
      (v.short ? `-${v.short}, ` : "") +
        `--${k}` +
        (v.$argument ? ` ${v.$argument}` : ""),
      v.$description ?? "",
    ]);
    output += `\
Options:
${formatIndent(formatRows(rows, 4), 2)}

`;
  }
  return output;
}

// copied from
// https://github.com/hi-ogawa/js-utils/blob/9acdc281f344a92fca242ffadf791427f726b564/packages/tiny-cli/src/utils.ts#L15

function formatRows(rows: string[][], space: number) {
  return padColumns(rows).map((row) => row.join(" ".repeat(space)).trimEnd());
}

function padColumns(rows: string[][]): string[][] {
  if (rows.length === 0) {
    return rows;
  }
  const ncol = Math.max(...rows.map((row) => row.length));
  const widths = range(ncol).map((c) =>
    Math.max(...rows.map((row) => row[c]?.length ?? 0))
  );
  const newRows = rows.map((row) =>
    row.map((v, i) => v.padEnd(widths[i], " "))
  );
  return newRows;
}

function formatIndent(ls: string[], n: number): string {
  return ls.map((v) => " ".repeat(n) + v).join("\n");
}
