// https://en.wikipedia.org/wiki/ANSI_escape_code#CSI_(Control_Sequence_Introducer)_sequences
// https://github.com/nodejs/node/blob/a717fa211194b735cdfc1044c7351c6cf96b8783/lib/internal/readline/utils.js
// https://github.com/terkelg/sisteransi/blob/e219f8672540dde6e92a19e48a3567ef2548d620/src/index.js
export const CSI = "\x1b[";

// cf. https://github.com/terkelg/prompts/blob/735603af7c7990ac9efcfba6146967a7dbb15f50/lib/util/clear.js#L5-L6
export function computeHeight(s: string, width: number) {
  // strip CSI
  const s2 = s.replaceAll(/\x1b\[\d*[A-Za-z]/g, "");

  // check line wrap
  const wraps = s2
    .split("\n")
    .map((line) => computeLineWrap(line.length, width));
  return wraps.reduce((x, y) => x + y);
}

function computeLineWrap(l: number, w: number) {
  return Math.floor(Math.max((l - 1) / w, 0) + 1);
}
