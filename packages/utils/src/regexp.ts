import { zip } from "./lodash";
import { tinyassert } from "./tinyassert";

/**
 * new RegExp(String.raw`...`) with inner strings are escaped which allows easier composition for matching urls e.g.
 * @example
 * regExpRaw`/username/${/\w+/}/profile`
 */
export function regExpRaw(
  { raw }: TemplateStringsArray,
  ...params: (string | RegExp)[]
): RegExp {
  tinyassert(raw.length === params.length + 1);
  return new RegExp(
    [...zip(raw, params.map(regExpRawInner)), raw.slice(-1)].flat().join("")
  );
}

function regExpRawInner(s: string | RegExp): string {
  return s instanceof RegExp
    ? s.source
    : s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
