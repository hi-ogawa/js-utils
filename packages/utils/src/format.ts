// inspired by
// https://doc.rust-lang.org/std/fmt/
// https://docs.python.org/3/library/string.html#format-string-syntax

type FormatPrimitive = string | number | boolean | null | undefined;
type FormatSpec = string | ParsedFormatSpec;
type FormatParam = FormatPrimitive | [FormatSpec, FormatPrimitive | unknown];

export function formatString(
  strings: TemplateStringsArray,
  ...params: FormatParam[]
) {
  strings;
  params;
  parseFormatSpec;
}

// https://doc.rust-lang.org/std/fmt/#syntax
type ParsedFormatSpec = {
  fill?: string;
  align?: "<" | "^" | ">";
  width?: number;
  sign?: "+";
  precision?: number;
  type?: "b" | "x" | "?";
};

function parseFormatSpec(spec: string): ParsedFormatSpec {
  spec;
  return {};
}

demo;
function demo() {
  const fmt = formatString;

  String.raw`${[0, 1]}`;

  fmt`hello`;
  fmt`hello ${"world"}!`;
  fmt`hello ${1}!`;

  // https://doc.rust-lang.org/std/fmt/#fillalignment

  // https://doc.rust-lang.org/std/fmt/#sign0

  // https://doc.rust-lang.org/std/fmt/#precision

  // https://doc.rust-lang.org/std/fmt/#formatting-traits
  // b
  //

  // leading zero padding
  fmt`${["02", 13]}:${["02", 5]}:${["02", 8]}.${["03", 12]}`;
  fmt`${[{ fill: "0", width: 2 }, 8]}.${[{ fill: "0", width: 3 }, 12]}`;

  // {}
  fmt`${8}:02`;
  fmt`hello ${[":04", 42]}`;
}
