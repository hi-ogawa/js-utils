import readline from "node:readline";
import { Writable } from "node:stream";
import { colors, includesGuard } from "@hiogawa/utils";

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

export function getSpecialKey(
  str: string | undefined,
  key: KeyInfo
): (typeof SPECIAL_KEYS)[number] | "abort" | undefined {
  // ctrl-c ctrl-z
  if (str === "\x03" || str === "\x1A") {
    return "abort";
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

// cf.
// https://github.com/natemoo-re/clack/blob/90f8e3d762e96fde614fdf8da0529866649fafe2/packages/core/src/prompts/prompt.ts#L93
// https://github.com/terkelg/prompts/blob/735603af7c7990ac9efcfba6146967a7dbb15f50/lib/elements/prompt.js#L22-L23
// TODO: rename to setupReadlineHandler
export function setupKeypressHandler(
  handler: (str: string | undefined, key: KeyInfo) => void,
  inputHandler?: (input: string, cursor: number) => void
) {
  // check readline state on dummy output callback
  const writeable = new Writable({
    highWaterMark: 0,
    write(_chunk, _encoding, callback) {
      inputHandler?.(rl.line, rl.cursor);
      callback();
    },
  });

  const stdin = process.stdin;
  const rl = readline.createInterface({
    input: stdin,
    output: writeable,
    terminal: true,
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
    writeable.destroy();
  };
}

export function formatInputCursor(input: string, cursor: number) {
  if (cursor >= input.length) {
    input += " ".repeat(input.length - cursor + 1);
  }
  const p1 = input.slice(0, cursor);
  const p2 = input.slice(cursor, cursor + 1);
  const p3 = input.slice(cursor + 1);
  return p1 + colors.inverse(p2) + p3;
}
