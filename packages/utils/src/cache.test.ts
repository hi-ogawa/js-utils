import { beforeEach, describe, expect, it, vi } from "vitest";
import { LruCache, TtlCache } from "./cache";

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

describe(LruCache, () => {
  it("basic", () => {
    const cache = new LruCache(3);
    cache.set(0, 0);
    cache.set(1, 1);
    cache.set(2, 2);
    cache.set(3, 3);
    expect(cache._map).toMatchInlineSnapshot(`
      Map {
        1 => 1,
        2 => 2,
        3 => 3,
      }
    `);
    expect(cache.get(1)).toMatchInlineSnapshot("1");
    expect(cache._map).toMatchInlineSnapshot(`
      Map {
        2 => 2,
        3 => 3,
        1 => 1,
      }
    `);
    expect(cache.set(0, 0)).toMatchInlineSnapshot("undefined");
    expect(cache._map).toMatchInlineSnapshot(`
      Map {
        3 => 3,
        1 => 1,
        0 => 0,
      }
    `);
  });
});
