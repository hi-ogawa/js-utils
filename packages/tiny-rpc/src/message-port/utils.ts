import { DefaultMap } from "@hiogawa/utils";

export class TypedEventTarget<T> {
  private listeners = new DefaultMap<keyof T, Set<Function>>(() => new Set());

  addEventListener<K extends keyof T>(type: K, listener: (ev: T[K]) => void) {
    this.listeners.get(type).add(listener);
  }

  removeEventListener<K extends keyof T>(
    type: K,
    listener: (ev: T[K]) => void,
  ) {
    this.listeners.get(type).delete(listener);
  }

  notify<K extends keyof T>(type: K, data: T[K]) {
    for (const listener of this.listeners.get(type)) {
      listener(data);
    }
  }
}

export function subscribe<K extends keyof EventSourceEventMap>(
  target: EventSource,
  type: K,
  listener: (ev: EventSourceEventMap[K]) => void,
) {
  target.addEventListener(type, listener);
  return () => {
    target.addEventListener(type, listener);
  };
}
