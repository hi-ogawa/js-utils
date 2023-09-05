export class TtlCache<K, V> {
  _map = new Map<K, { t: number; v: V }>();

  constructor(private ttlMs: number) {}

  get(k: K): V | undefined {
    const found = this._map.get(k);
    if (typeof found !== "undefined") {
      const { t, v } = found;
      if (Date.now() < t + this.ttlMs) {
        return v;
      }
      this._map.delete(k);
    }
    return;
  }

  set(k: K, v: V) {
    this._map.set(k, { t: Date.now(), v });
  }
}

export class LruCache<K, V> {
  // expose to allow probing internal e.g. for initializing cache
  _map = new Map<K, V>();

  constructor(private maxSize: number) {}

  get(k: K): V | undefined {
    if (this._map.has(k)) {
      // delete + set to simualte LRU order
      const v = this._map.get(k)!;
      this._map.delete(k);
      this._map.set(k, v);
    }
    return this._map.get(k);
  }

  set(k: K, v: V) {
    this._map.set(k, v);
    this.fixSize();
  }

  private fixSize() {
    while (this._map.size > this.maxSize) {
      const next = this._map.keys().next();
      if (next.done) {
        break;
      }
      this._map.delete(next.value);
    }
  }
}

export function onceTtl<F extends (...args: any[]) => any>(
  f: F,
  ttlMs: number
): F {
  let cache: { t: number; v: ReturnType<F> } | undefined;
  function wrapper(this: any, ...args: any[]) {
    const now = Date.now();
    if (!cache || cache.t + ttlMs < now) {
      cache = { t: now, v: f.apply(this, args) };
    }
    return cache.v;
  }
  return wrapper as any;
}
