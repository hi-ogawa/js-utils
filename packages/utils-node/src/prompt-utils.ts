// https://en.wikipedia.org/wiki/ANSI_escape_code#CSI_(Control_Sequence_Introducer)_sequences
// https://github.com/nodejs/node/blob/a717fa211194b735cdfc1044c7351c6cf96b8783/lib/internal/readline/utils.js
// https://github.com/terkelg/sisteransi/blob/e219f8672540dde6e92a19e48a3567ef2548d620/src/index.js
const kEscape = `\x1b`;
const CSI = `${kEscape}[`;
export const kClearToLineBeginning = `${CSI}1K`;
export const kClearToLineEnd = `${CSI}1K`;
export const kClearLine = `${CSI}2K`;
export const kClearScreenDown = `${CSI}0J`;

export function cursorTo(x: number, y?: number) {
  return typeof y !== "number" ? `${CSI}${x + 1}G` : `${CSI}${y + 1};${x + 1}H`;
}

export function moveCursor(dx: number, dy: number) {
  return [
    dx < 0 && `${CSI}${-dx}D`,
    dx > 0 && `${CSI}${dx}C`,
    dy < 0 && `${CSI}${-dy}A`,
    dy > 0 && `${CSI}${dy}B`,
  ]
    .filter(Boolean)
    .join("");
}
