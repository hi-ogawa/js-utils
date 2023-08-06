import { beforeEach, describe, expect, it, vi } from "vitest";
import { consoleErrorExtra } from "./error";

describe(consoleErrorExtra, () => {
  let consoleErrorHistory: any[];

  beforeEach(() => {
    consoleErrorHistory = [];
    vi.spyOn(console, "error").mockImplementation((v) => {
      // wipe stacktrace
      if (typeof v === "string") {
        v = v.replace(/at .*/g, "at (reducted)");
      }
      consoleErrorHistory.push(v);
    });
    return () => {
      vi.restoreAllMocks();
    };
  });

  it("basic", () => {
    const e1 = new Error("e1", { cause: "just-string" });
    const e2 = new Error("e2", { cause: e1 });
    consoleErrorExtra(e2);
    expect(consoleErrorHistory).toMatchInlineSnapshot(`
      [
        "
      [ERROR] e2

          at (reducted)
          at (reducted)
          at (reducted)
          at (reducted)
          at (reducted)
          at (reducted)
          at (reducted)
          at (reducted)
          at (reducted)
          at (reducted)
      ",
        "
      [ERROR] e1

          at (reducted)
          at (reducted)
          at (reducted)
          at (reducted)
          at (reducted)
          at (reducted)
          at (reducted)
          at (reducted)
          at (reducted)
          at (reducted)
      ",
        "just-string",
      ]
    `);
  });
});
