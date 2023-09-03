// ansi escape codes
// https://en.wikipedia.org/wiki/ANSI_escape_code#SGR_(Select_Graphic_Rendition)_parameters
// https://github.com/chalk/chalk
// https://github.com/alexeyraspopov/picocolors
const codes = [
  // 3 bit fg/bg colors
  ["black", 30, 39],
  ["red", 31, 39],
  ["green", 32, 39],
  ["yellow", 33, 39],
  ["blue", 34, 39],
  ["magenta", 35, 39],
  ["cyan", 36, 39],
  ["white", 37, 39],
  ["bgBlack", 40, 49],
  ["bgRed", 41, 49],
  ["bgGreen", 42, 49],
  ["bgYellow", 43, 49],
  ["bgBlue", 44, 49],
  ["bgMagenta", 45, 49],
  ["bgCyan", 46, 49],
  ["bgWhite", 47, 49],
  // styles
  ["bold", 1, 22],
  ["dim", 2, 22],
  ["underline", 4, 24],
  ["inverse", 7, 27],
] as const;

export const colors = /* @__PURE__ */ (() =>
  Object.fromEntries(
    codes.map(([name, start, end]) => [
      name,
      (v: string) => `\u001B[${start}m${v}\u001B[${end}m`,
    ])
  ) as Record<(typeof codes)[number][0], (v: string) => string>)();
