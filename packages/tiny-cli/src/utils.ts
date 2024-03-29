import { range } from "@hiogawa/utils";

export const DEFAULT_PROGRAM = "example-cli";

export class TinyCliParseError extends Error {
  static wrapFn<T>(message: string, f: () => T): T {
    try {
      return f();
    } catch (e) {
      throw new TinyCliParseError(message, { cause: e });
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
