import { useSyncExternalStore } from "@hiogawa/tiny-react";
import { getRequestContext } from "../server/request-context";

class WindowHistoryStore {
  private listeners = new Set<() => void>();
  private url = new URL(window.location.href);

  get = () => this.url;

  set = (url: URL) => {
    window.history.pushState(null, "", url);
    this.url = new URL(window.location.href);
    this.notify();
  };

  subscribe = (listener: () => void) => {
    if (this.listeners.size === 0) {
      window.addEventListener("popstate", this.onPopstate);
    }
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) {
        window.removeEventListener("popstate", this.onPopstate);
      }
    };
  };

  private notify = () => {
    for (const listener of this.listeners) {
      listener();
    }
  };

  private onPopstate = () => {
    this.url = new URL(window.location.href);
    this.notify();
  };
}

// initialize only on client
export const historyStore = !import.meta.env.SSR
  ? new WindowHistoryStore()
  : undefined!;

export function useUrl() {
  if (import.meta.env.SSR) {
    const url = getRequestContext().url;
    return [url, (_url: URL) => {}] as const;
  }
  const url = useSyncExternalStore(
    historyStore.subscribe,
    historyStore.get,
    historyStore.get
  );
  return [url, historyStore.set] as const;
}
