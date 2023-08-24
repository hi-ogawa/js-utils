// inspired by
// https://doc.rust-lang.org/std/fmt/
// https://docs.python.org/3/library/string.html#format-string-syntax

export function formatString(s: string) {
  s;
  // String.raw`Hello`;
  // ["s", ]
}

demo;
function demo() {
  const fmt = String.raw;

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
  fmt`${[":04", 2022]}-${[":02", 8]}-${[":02", 24]}:${[":03", 12]}`;

  // {}
  fmt`${8}:02`;
  fmt`hello ${[":04", 42]}`;
}
