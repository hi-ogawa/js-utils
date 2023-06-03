import { zip } from "./lodash";
import { tinyassert } from "./tinyassert";

/**
 * new RegExp(String.raw`...`) with inner strings are escaped which allows easier composition for matching urls e.g.
 * @example
 * regExpRaw`/username/${/\w+/}/profile`
 */
export function regExpRaw(
  { raw }: TemplateStringsArray,
  ...params: RegExp[]
): RegExp {
  tinyassert(raw.length === params.length + 1);
  return new RegExp(
    [
      ...zip(
        raw,
        params.map((p) => p.source)
      ),
      raw.slice(-1),
    ]
      .flat()
      .join("")
  );
}

// from https://stackoverflow.com/a/3561711
export function escapeRegExp(input: string): string {
  return input.replace(/[/\-\\^$*+?.()|[\]{}]/g, "\\$&");
}

// based on https://github.com/unocss/unocss/blob/2e74b31625bbe3b9c8351570749aa2d3f799d919/packages/autocomplete/src/parse.ts#L11
export function mapRegExp(
  input: string,
  regex: RegExp,
  onMatch: (match: RegExpMatchArray) => void,
  onNonMatch: (part: string) => void
) {
  let lastIndex = 0;
  for (const m of input.matchAll(regex)) {
    tinyassert(typeof m.index === "number");
    if (lastIndex < m.index) {
      onNonMatch(input.slice(lastIndex, m.index));
    }
    onMatch(m);
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < input.length) {
    onNonMatch(input.slice(lastIndex));
  }
}
