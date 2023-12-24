import readline from "node:readline";
import { includesGuard } from "@hiogawa/utils";

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

// extracted from https://github.com/nodejs/node/blob/ee61c2c6d3e97425b16d6821118084a833e52e29/lib/internal/readline/utils.js#L222 by
//   node packages/utils-node/misc/scrape-keys.mjs
const SPECIAL_KEYS = [
  "f1",
  "f2",
  "f3",
  "f4",
  "f5",
  "f6",
  "f7",
  "f8",
  "f9",
  "f10",
  "f11",
  "f12",
  "up",
  "down",
  "right",
  "left",
  "clear",
  "end",
  "home",
  "insert",
  "delete",
  "pageup",
  "pagedown",
  "tab",
  "undefined",
  "return",
  "enter",
  "backspace",
  "escape",
  "space",
  "paste-start",
  "paste-end",
] as const;

export function getSpecialKey(str: string | undefined, key: KeyInfo) {
  // ctrl-c ctrl-z
  if (str === "\x03" || str === "\x1A") {
    return "abort" as const;
  }
  if (includesGuard(SPECIAL_KEYS, key.name)) {
    return key.name;
  }
  return;
}

export interface KeyInfo {
  sequence: string;
  name: string;
  ctrl: boolean;
  meta: boolean;
  shift: boolean;
}

export function setupKeypressHandler(
  handler: (str: string | undefined, key: KeyInfo) => void
) {
  // setup
  const stdin = process.stdin;
  const rl = readline.createInterface({
    input: stdin,
  });
  readline.emitKeypressEvents(stdin, rl);
  let previousRawMode = stdin.isRaw;
  if (stdin.isTTY) {
    stdin.setRawMode(true);
  }
  stdin.on("keypress", handler);

  // teardown
  return () => {
    stdin.off("keypress", handler);
    if (stdin.isTTY) {
      stdin.setRawMode(previousRawMode);
    }
    rl.close();
  };
}
