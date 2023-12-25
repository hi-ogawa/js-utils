import readline from "node:readline";
import { Writable } from "node:stream";
import { colors, includesGuard } from "@hiogawa/utils";

// https://en.wikipedia.org/wiki/ANSI_escape_code#CSI_(Control_Sequence_Introducer)_sequences
// https://github.com/nodejs/node/blob/a717fa211194b735cdfc1044c7351c6cf96b8783/lib/internal/readline/utils.js
// https://github.com/terkelg/sisteransi/blob/e219f8672540dde6e92a19e48a3567ef2548d620/src/index.js
export const CSI = "\x1b[";

// CSI (num) (char)
// CSI (num) ; (num) (char)
// CSI ? (num) (char)
const CSI_RE = /\x1b\[\??\d*;?\d*[A-Za-z]/g;

// poor-man's strip ansi code
export function stripAnsi(s: string) {
  return s.replaceAll(CSI_RE, "");
}

// cf. https://github.com/terkelg/prompts/blob/735603af7c7990ac9efcfba6146967a7dbb15f50/lib/util/clear.js#L5-L6
export function computeHeight(s: string, width: number) {
  // strip CSI
  s = stripAnsi(s);

  // check line wrap
  const wraps = s
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

export function getSpecialKey({
  input,
  key,
}: ReadlineKeypressEvent): (typeof SPECIAL_KEYS)[number] | "abort" | undefined {
  // ctrl-c ctrl-z
  if (input === "\x03" || input === "\x1A") {
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

export interface ReadlineKeypressEvent {
  input?: string;
  key: KeyInfo;
}

export function subscribePromptEvent(
  handler: (e: ReadlineKeypressEvent) => void
) {
  // cf.
  // https://github.com/natemoo-re/clack/blob/90f8e3d762e96fde614fdf8da0529866649fafe2/packages/core/src/prompts/prompt.ts#L93
  // https://github.com/terkelg/prompts/blob/735603af7c7990ac9efcfba6146967a7dbb15f50/lib/elements/prompt.js#L22-L23

  // setup dummy output stream to keep track of readline.line/cursor
  const writeable = new Writable({
    highWaterMark: 0,
    write: (_chunk, _encoding, callback) => {
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

  function onKeypress(input: string | undefined, key: KeyInfo) {
    handler({
      input,
      key,
    });
  }
  stdin.on("keypress", onKeypress);

  function dispose() {
    stdin.off("keypress", onKeypress);
    if (stdin.isTTY) {
      stdin.setRawMode(previousRawMode);
    }
    rl.close();
    writeable.destroy();
  }

  return { rl, dispose };
}

export function formatInputCursor({
  line,
  cursor,
}: {
  line: string;
  cursor: number;
}) {
  if (cursor >= line.length) {
    line += " ".repeat(line.length - cursor + 1);
  }
  const p1 = line.slice(0, cursor);
  const p2 = line.slice(cursor, cursor + 1);
  const p3 = line.slice(cursor + 1);
  return p1 + colors.inverse(p2) + p3;
}
