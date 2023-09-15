import React from "react";
import type { TinyStoreApi } from "./core";
import { createTinyStoreWithStorage } from "./local-storage";

export function useTinyStore<T, RO extends boolean>(
  store: TinyStoreApi<T, RO>
): [T, TinyStoreApi<T, RO>["set"]] {
  React.useSyncExternalStore(store.subscribe, store.get, store.get);
  return [store.get(), store.set];
}

export function useTinyStoreStorage<T>(key: string, defaultValue: T) {
  const store = React.useMemo(
    () => createTinyStoreWithStorage(key, defaultValue),
    [key]
  );
  return useTinyStore(store);
}
