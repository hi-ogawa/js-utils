import fs from "node:fs";
import path from "node:path";
import { LruCache, hashString, memoize } from "@hiogawa/utils";

export function memoizeOnFile<F extends (...args: any[]) => any>(
  f: F,
  options: { disabled?: boolean; file: string; maxSize: number }
) {
  if (options.disabled) {
    return [f, undefined] as const;
  }

  const cache = new LruCache<string, any>(options.maxSize);

  async function load() {
    if (fs.existsSync(options.file)) {
      const raw = await fs.promises.readFile(options.file, "utf-8");
      const data = JSON.parse(raw);
      cache._map = new Map(data);
    }
  }

  async function save() {
    const data = JSON.stringify([...cache._map.entries()]);
    await fs.promises.mkdir(path.dirname(options.file), { recursive: true });
    await fs.promises.writeFile(options.file, data);
  }

  const memoized = memoize(f, {
    keyFn: (...args) => hashString(JSON.stringify(args)),
    cache,
  });

  return [memoized, { load, save }] as const;
}
