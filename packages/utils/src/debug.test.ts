import { describe, expect, it, vi } from "vitest";
import { createDebug, createDebugPattern } from "./debug";

describe(createDebug, () => {
  it("basic", () => {
    const fn = vi.fn();
    vi.spyOn(console, "error").mockImplementation(fn);
    function lastCll() {
      const call = fn.mock.calls.at(-1);
      fn.mockClear();
      return call;
    }

    const debug = createDebug("react-server:plugin");
    debug("test");
    expect(lastCll()).toMatchInlineSnapshot(`undefined`);
    (globalThis as any).__DEBUG = "react-server";
    debug("test");
    expect(lastCll()).toMatchInlineSnapshot(`undefined`);
    (globalThis as any).__DEBUG = "react-server:plugin";
    debug("test");
    expect(lastCll()).toMatchInlineSnapshot(`
      [
        "⊳ react-server:plugin",
        "test",
      ]
    `);
    (globalThis as any).__DEBUG = "react-server:*";
    debug("test");
    expect(lastCll()).toMatchInlineSnapshot(`
      [
        "⊳ react-server:plugin",
        "test",
      ]
    `);
    (globalThis as any).__DEBUG = "noooo:react-server:*";
    debug("test");
    expect(lastCll()).toMatchInlineSnapshot(`undefined`);
    (globalThis as any).__DEBUG = "react-server:plugin:*";
    debug("test");
    expect(lastCll()).toMatchInlineSnapshot(`undefined`);
  });

  it(createDebugPattern, () => {
    expect(createDebugPattern("react-server").source).toMatchInlineSnapshot(
      `"(^|,)(react\\-server)($|,)"`
    );
    expect(
      createDebugPattern("react-server:plugin").source
    ).toMatchInlineSnapshot(
      `"(^|,)(react\\-server:plugin|react\\-server:\\*)($|,)"`
    );
    expect(
      createDebugPattern("react-server:plugin:browser").source
    ).toMatchInlineSnapshot(
      `"(^|,)(react\\-server:plugin:browser|react\\-server:\\*|react\\-server:plugin:\\*)($|,)"`
    );
  });
});
