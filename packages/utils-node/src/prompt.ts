import readline from "node:readline";
import { promisify } from "node:util";
import { colors, createManualPromise } from "@hiogawa/utils";
import {
  CSI,
  computeHeight,
  formatInputCursor,
  getSpecialKey,
  subscribeReadlineEvent,
} from "./prompt-utils";

// cf. https://github.com/google/zx/blob/956dcc3bbdd349ac4c41f8db51add4efa2f58456/src/goods.ts#L83
export async function promptQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  // delegate SIGINT (cf. https://github.com/SBoudrias/Inquirer.js/pull/569)
  rl.once("SIGINT", () => {
    rl.write("\n"); // tiny aesthetics to get next cursor after new line
    process.kill(process.pid, "SIGINT");
  });
  try {
    const manual = createManualPromise<string>();
    rl.question(query, (v) => manual.resolve(v));
    return await manual.promise;
  } finally {
    rl.close();
  }
}

export async function promptAutocomplete(options: {
  message: string;
  suggest: (input: string) => string[] | Promise<string[]>;
  limit?: number;
  debugCursor?: boolean;
}) {
  const write = promisify(process.stdout.write.bind(process.stdout));
  const manual = createManualPromise<void>();
  let lastRender = "";

  // states
  let input = "";
  let cursor = 0;
  let value: string | undefined;
  let suggestions: string[] = [];
  let suggestionIndex = 0;
  let done = false;
  let offset = 0;
  // TODO: listen "resize" event?
  const limit = options.limit ?? Math.min(10, (process.stdout.rows ?? 20) - 5);

  async function updateSuggestions() {
    suggestions = await options.suggest(input);
    suggestionIndex = 0;
    offset = 0;
    value = suggestions[suggestionIndex];
  }

  function moveSelection(dir: -1 | 1) {
    suggestionIndex += dir;
    suggestionIndex = Math.min(
      Math.max(suggestionIndex, 0),
      suggestions.length - 1,
    );
    value = suggestions[suggestionIndex];

    // scroll `offset` to keep `suggestionIndex` in range
    if (suggestionIndex < offset) {
      offset = suggestionIndex;
    }
    if (offset + limit <= suggestionIndex) {
      offset = suggestionIndex + 1 - limit;
    }
  }

  // TODO: custom pure render function based on states?
  function renderImpl() {
    if (done) {
      return (
        (value ? "o" : "x") +
        " " +
        options.message +
        colors.dim(" > ") +
        (value ?? input) +
        "\n"
      );
    }

    let content =
      "* " +
      options.message +
      colors.dim(" > ") +
      formatInputCursor({ line: input, cursor });

    content += "\n";
    content += suggestions
      .slice(offset, offset + limit)
      .map(
        (v, i) =>
          "  " +
          (i + offset === suggestionIndex ? `> ${v}` : `  ${colors.dim(v)}`) +
          "\n",
      )
      .join("");

    const total = suggestions.length;
    const current = Math.min(suggestionIndex + 1, total);
    content += colors.dim(`  [${current}/${total}]\n`);

    return content;
  }

  async function render() {
    const nextRender = renderImpl();
    const clearLastRender = clearContent(lastRender, process.stdout.columns);
    lastRender = nextRender;
    await write(clearLastRender + nextRender);
  }

  // TODO: async handler race condition
  const { rl, dispose } = subscribeReadlineEvent(async (e) => {
    switch (getSpecialKey(e)) {
      case "abort":
      case "escape": {
        value = undefined;
        done = true;
        manual.resolve();
        return;
      }
      case "enter":
      case "return": {
        done = true;
        manual.resolve();
        return;
      }
      case "up": {
        moveSelection(-1);
        await render();
        return;
      }
      case "down": {
        moveSelection(1);
        await render();
        return;
      }
    }
    if (input !== rl.line || cursor !== rl.cursor) {
      if (input !== rl.line) {
        input = rl.line;
        await updateSuggestions();
      }
      cursor = rl.cursor;
      await render();
    }
  });

  try {
    if (!options.debugCursor) {
      await write(`${CSI}?25l`); // hide cursor
    }
    await updateSuggestions();
    await render();
    await manual.promise;
    return { input, value };
  } finally {
    dispose?.();
    await render();
    if (!options.debugCursor) {
      await write(`${CSI}?25h`); // show cursor
    }
  }
}

function clearContent(content: string, width: number): string {
  // TODO: vscode's terminal has funky behavior when content height exceeds terminal height?
  // TODO: IME (e.g Japanese input) cursor is currently not considered.

  // - cursor up by `height`
  // - cursor to left
  // - clear below
  const height = computeHeight(content, width);
  return `${CSI}1A`.repeat(height - 1) + `${CSI}1G` + `${CSI}0J`;
}
