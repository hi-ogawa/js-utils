import {
  type SimpleStore,
  type SimpleStoreAdapter,
  SimpleStoreBase,
  storeTransform,
} from "./core";

// ssr fallbacks to `defaultValue` which can cause hydration mismatch
export function createSimpleStoreWithLocalStorage<T>(
  key: string,
  defaultValue: T,
  parse = JSON.parse,
  stringify = JSON.stringify
): SimpleStore<T> {
  return storeTransform<string | null, T>(
    new SimpleStoreBase(new LocalStorageAdapter(key)),
    (s: string | null): T => (s === null ? defaultValue : parse(s)),
    (t: T): string | null => stringify(t)
  );
}

class LocalStorageAdapter implements SimpleStoreAdapter<string | null> {
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

  // TODO: this will register event listener for each observer of each store, which might be excessive.
  subscribe = (listener: () => void) => {
    if (typeof window === "undefined") {
      return () => {};
    }
    const handler = (e: StorageEvent) => {
      // key is null when localStorage.clear
      if (e.key === this.key || e.key === null) {
        listener();
      }
    };
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("storage", handler);
    };
  };
}
