// 3 bit ansi colors (nested usage are not supported)
// https://en.wikipedia.org/wiki/ANSI_escape_code#SGR_(Select_Graphic_Rendition)_parameters
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
type Color = BaseColor | `bg${Capitalize<BaseColor>}`;

export const colors = /* @__PURE__ */ (() =>
  Object.fromEntries(
    baseColors.flatMap((fg, i) => {
      const bg = `bg${fg.slice(0, 1).toUpperCase()}${fg.slice(1)}`;
      return [
        [fg, (v: string) => `\u001B[${30 + i}m${v}\u001B[39m`],
        [bg, (v: string) => `\u001B[${40 + i}m${v}\u001B[49m`],
      ] as any;
    })
  ) as Record<Color, (v: string) => string>)();
