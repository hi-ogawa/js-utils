import { beforeEach, describe, expect, it, vi } from "vitest";
import { TtlCache } from "./cache";

describe(TtlCache, () => {
  beforeEach(() => {
    vi.useFakeTimers();
    return () => {
      vi.resetAllMocks();
    };
  });

  it("basic", () => {
    const cache = new TtlCache(900);

    vi.setSystemTime(0);
    cache.set("k", "v");
    expect(cache.get("k")).toMatchInlineSnapshot('"v"');
    expect(cache.get("k2")).toMatchInlineSnapshot("undefined");

    vi.setSystemTime(500);
    expect(cache.get("k")).toMatchInlineSnapshot('"v"');
    expect(cache.get("k2")).toMatchInlineSnapshot("undefined");
    cache.set("k2", "v2");
    expect(cache.get("k2")).toMatchInlineSnapshot('"v2"');

    vi.setSystemTime(1000);
    expect(cache.get("k")).toMatchInlineSnapshot("undefined");
    expect(cache.get("k2")).toMatchInlineSnapshot('"v2"');

    vi.setSystemTime(1500);
    expect(cache.get("k")).toMatchInlineSnapshot("undefined");
    expect(cache.get("k2")).toMatchInlineSnapshot("undefined");
  });
});
