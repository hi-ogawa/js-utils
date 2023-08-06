import { beforeEach, describe, expect, it, vi } from "vitest";
import { consoleErrorPretty, flattenErrorCauses } from "./error";

describe(consoleErrorPretty, () => {
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
    consoleErrorPretty(e2, { noColor: true });
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
      [ERROR:CAUSE] e1

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
      [ERROR:CAUSE:2] just-string

      ",
      ]
    `);
  });

  it("noColor", () => {
    const e1 = new Error("e1", { cause: "just-string" });
    const e2 = new Error("e2", { cause: e1 });
    consoleErrorPretty(e2);
    expect(consoleErrorHistory).toMatchInlineSnapshot(`
      [
        "
      [41m ERROR [49m e2

      [36m    at (reducted)
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
      [41m ERROR:CAUSE [49m e1

      [36m    at (reducted)
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
      [41m ERROR:CAUSE:2 [49m just-string

      ",
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
