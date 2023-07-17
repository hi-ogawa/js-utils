import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loggerMiddleware } from "./logger-middleware";

describe(loggerMiddleware, () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("basic", async () => {
    let logs: string[] = [];
    const logger = loggerMiddleware({ log: (v) => logs.push(v) });

    vi.setSystemTime(new Date("2020-02-02T00:00:00.000Z"));
    await logger({
      request: { url: "http://dummy.local/test", method: "GET" },
      next: async () => {
        vi.setSystemTime(new Date("2020-02-02T00:00:00.123Z"));
        return new Response(null, { status: 200 });
      },
    });

    expect(logs).toMatchInlineSnapshot(`
      [
        "  --> GET /test",
        "  <-- GET /test 200 123ms",
      ]
    `);

    vi.setSystemTime(new Date("2020-02-02T00:00:00.000Z"));
    await logger({
      request: { url: "http://dummy.local/test2", method: "POST" },
      next: async () => {
        vi.setSystemTime(new Date("2020-02-02T00:00:01.230Z"));
        return new Response(null, { status: 302 });
      },
    });

    expect(logs).toMatchInlineSnapshot(`
      [
        "  --> GET /test",
        "  <-- GET /test 200 123ms",
        "  --> POST /test2",
        "  <-- POST /test2 302 1.2s",
      ]
    `);
  });
});
