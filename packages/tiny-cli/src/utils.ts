import { flattenErrorCauses, range } from "@hiogawa/utils";

export const DEFAULT_PROGRAM = "(cli)";

export class ParseError extends Error {
  static wrapFn<T>(message: string, f: () => T): T {
    try {
      return f();
    } catch (e) {
      throw new ParseError(message, { cause: e });
    }
  }
}

export function formatTable(rows: string[][]) {
  return formatIndent(
    padColumns(rows).map((row) => row.join(" ".repeat(4)).trimEnd()),
    2
  );
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

// consola.error + flattenErrorCauses
// to provide good-enough cli error handling experience by default
// TODO: maybe move it to `packages/utlis`?
export function consoleErrorExtra(e: unknown) {
  for (const err of flattenErrorCauses(e)) {
    if (err instanceof Error) {
      console.error(formatError(err));
    } else {
      console.error(err);
    }
  }
}

// simpler port of consola.error
// https://github.com/unjs/consola/blob/e4a37c1cd2c8d96b5f30d8c13ff2df32244baa6a/src/utils/color.ts#L93
// https://github.com/unjs/consola/blob/e4a37c1cd2c8d96b5f30d8c13ff2df32244baa6a/src/reporters/fancy.ts#L49
// https://github.com/unjs/consola/blob/e4a37c1cd2c8d96b5f30d8c13ff2df32244baa6a/src/reporters/fancy.ts#L64-L65
function formatError(e: Error) {
  // color?
  // \u001B[41m ERROR \u001B[49m
  // \u001B[36m${stack}\u001B[39m

  let result = `\

[ERROR] ${e.message}

`;
  if (e.stack) {
    const stack = e.stack.split("\n").slice(1).join("\n");
    result += `\
${stack}
`;
  }
  return result;
}
