import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createLoggerHandler } from "./logger";

describe(createLoggerHandler, () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("basic", async () => {
    const logFn = vi.fn();
    const logger = createLoggerHandler({ log: logFn });

    vi.setSystemTime(new Date("2020-02-02T00:00:00.000Z"));
    await logger({
      request: new Request("http://dummy.local/test"),
      next: async () => {
        vi.setSystemTime(new Date("2020-02-02T00:00:00.123Z"));
        return new Response(null, { status: 200 });
      },
    });

    expect(logFn.mock.calls.map((v) => v[0])).toMatchInlineSnapshot(`
      [
        "  --> GET /test",
        "  <-- GET /test 200 123ms",
      ]
    `);
    logFn.mockReset();

    vi.setSystemTime(new Date("2020-02-02T00:00:00.000Z"));
    await logger({
      request: new Request("http://dummy.local/test2", { method: "POST" }),
      next: async () => {
        vi.setSystemTime(new Date("2020-02-02T00:00:01.230Z"));
        return new Response(null, { status: 302 });
      },
    });

    expect(logFn.mock.calls.map((v) => v[0])).toMatchInlineSnapshot(`
      [
        "  --> POST /test2",
        "  <-- POST /test2 302 1.2s",
      ]
    `);
  });
});
