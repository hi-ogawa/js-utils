import React from "react";
import type { TinyStoreApi } from "./core";
import { createTinyStoreWithStorage } from "./local-storage";

export function useTinyStore<T, IsReadonly extends boolean>(
  store: TinyStoreApi<T, IsReadonly>
) {
  React.useSyncExternalStore(store.subscribe, store.get, store.get);
  return [store.get(), store.set] as const;
}

export function useTinyLocalStorage<T>(key: string, defaultValue: T) {
  const store = React.useMemo(
    () => createTinyStoreWithStorage(key, defaultValue),
    [key]
  );
  return useTinyStore(store);
}
