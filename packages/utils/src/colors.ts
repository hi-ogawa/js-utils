// 4 bit ansi colors
// https://en.wikipedia.org/wiki/ANSI_escape_code#3-bit_and_4-bit
// https://github.com/chalk/chalk
// https://github.com/alexeyraspopov/picocolors
const baseColors = [
  "black",
  "red",
  "green",
  "yellow",
  "blue",
  "magenta",
  "cyan",
  "white",
] as const;
type BaseColor = (typeof baseColors)[number];
type Color1 = BaseColor | `bg${Capitalize<BaseColor>}`;
type Color = Color1 | `${Color1}Bright`;

export const colors = /* @__PURE__ */ (() =>
  Object.fromEntries(
    baseColors.flatMap((fg, i) => {
      const bg = `bg${fg.slice(0, 1).toUpperCase()}${fg.slice(1)}`;
      const fgBright = fg + "Bright";
      const bgBright = bg + "Bright";
      return [
        [fg, (v: string) => `\u001B[${30 + i}m${v}\u001B[39m`],
        [bg, (v: string) => `\u001B[${40 + i}m${v}\u001B[49m`],
        [fgBright, (v: string) => `\u001B[${90 + i}m${v}\u001B[39m`],
        [bgBright, (v: string) => `\u001B[${100 + i}m${v}\u001B[49m`],
      ];
    })
  ) as Record<Color, (v: string) => string>)();
