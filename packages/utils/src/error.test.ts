import { beforeEach, describe, expect, it, vi } from "vitest";
import { consoleErrorExtra, flattenErrorCauses } from "./error";

describe(consoleErrorExtra, () => {
  let consoleErrorHistory: any[];

  beforeEach(() => {
    consoleErrorHistory = [];
    vi.spyOn(console, "error").mockImplementation((v) => {
      // wipe stacktrace for reproducibility
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

describe(flattenErrorCauses, () => {
  it("handle cyclic reference", () => {
    const e1 = new Error("e1");
    const e2 = new Error("e2", { cause: e1 });
    e1.cause = e2;
    expect(flattenErrorCauses(e1)).toMatchInlineSnapshot(`
      [
        [Error: e1],
        [Error: e2],
      ]
    `);
  });
});
