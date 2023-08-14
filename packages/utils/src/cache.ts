export class TtlCache<K, V> {
  private map = new Map<K, { t: number; v: V }>();

  constructor(private ttlMs: number) {}

  get(k: K): V | undefined {
    const found = this.map.get(k);
    if (typeof found !== "undefined") {
      const { t, v } = found;
      if (Date.now() < t + this.ttlMs) {
        return v;
      }
      this.map.delete(k);
    }
    return;
  }

  set(k: K, v: V) {
    this.map.set(k, { t: Date.now(), v });
  }
}
