import { subscribeEventListenerFactory, tinyassert } from "@hiogawa/utils";
import {
  TinyStore,
  type TinyStoreAdapter,
  type TinyStoreApi,
  tinyStoreTransform,
} from "./core";

// ssr fallbacks to `defaultValue` which can cause hydration mismatch
export function createTinyStoreWithStorage<T>(
  key: string,
  defaultValue: T,
  parse = JSON.parse,
  stringify = JSON.stringify
): TinyStoreApi<T> {
  return tinyStoreTransform<string | null, T>(
    new TinyStore(new TinyStoreLocalStorageAdapter(key)),
    (s: string | null): T => (s === null ? defaultValue : parse(s)),
    (t: T): string | null => stringify(t)
  );
}

class TinyStoreLocalStorageAdapter implements TinyStoreAdapter<string | null> {
  constructor(private key: string) {}

  get() {
    if (typeof window === "undefined") {
      return null;
    }
    return window.localStorage.getItem(this.key);
  }

  set(value: string | null) {
    if (value === null) {
      window.localStorage.removeItem(this.key);
    } else {
      window.localStorage.setItem(this.key, value);
    }
  }

  private listeners = new Set<() => void>();

  subscribe = (listener: () => void) => {
    if (typeof window === "undefined") {
      return () => {};
    }
    this.listenInternal();
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
      this.unlistenInternal();
    };
  };

  // register actual event listener only once per store
  private _unlisten?: () => void;

  private listenInternal() {
    if (this.listeners.size > 0) {
      return;
    }
    tinyassert(!this._unlisten);
    this._unlisten = subscribeEventListenerFactory<WindowEventMap>(window)(
      "storage",
      (e) => {
        // key is null when localStorage.clear
        if (e.key === this.key || e.key === null) {
          this.listeners.forEach((f) => f());
        }
      }
    );
  }

  private unlistenInternal() {
    if (this.listeners.size > 0) {
      return;
    }
    tinyassert(this._unlisten);
    this._unlisten();
  }
}
