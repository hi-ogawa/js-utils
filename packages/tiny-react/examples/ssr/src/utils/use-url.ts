import { useSyncExternalStore } from "@hiogawa/tiny-react";
import { tinyassert } from "@hiogawa/utils";
import { getRequestContext } from "../server/request-context";

// simple global window url manager
class WindowUrlStore {
  private listeners = new Set<() => void>();

  // support fallback e.g. to hook into request async context for SSR scenario
  constructor(private options?: { fallback?: () => string }) {}

  get = (): string => {
    return this.options?.fallback?.() ?? window.location.href;
  };

  set = (url: string, options?: { replace?: true }) => {
    tinyassert(!this.options?.fallback, "cannot set url with fallback");
    if (options?.replace) {
      window.history.replaceState(null, "", url);
    } else {
      window.history.pushState(null, "", url);
    }
    this.notify();
  };

  subscribe = (listener: () => void) => {
    if (this.options?.fallback) {
      return () => {};
    }
    if (this.listeners.size === 0) {
      window.addEventListener("popstate", this.notify);
    }
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) {
        window.removeEventListener("popstate", this.notify);
      }
    };
  };

  private notify = () => {
    for (const listener of this.listeners) {
      listener();
    }
  };
}

const windowUrlStore = new WindowUrlStore({
  fallback: import.meta.env.SSR
    ? () => getRequestContext().url.href
    : undefined,
});

export function useUrl() {
  const url = useSyncExternalStore(
    windowUrlStore.subscribe,
    windowUrlStore.get,
    windowUrlStore.get
  );
  return [url, windowUrlStore.set] as const;
}
