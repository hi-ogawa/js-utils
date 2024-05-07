import { useMemo, useSyncExternalStore } from "react";
import type { TinyStoreApi } from "./core";
import { createTinyStoreWithStorage } from "./local-storage";

export function useTinyStore<T, RO extends boolean>(
  store: TinyStoreApi<T, RO>,
): [T, TinyStoreApi<T, RO>["set"]] {
  const value = useSyncExternalStore(store.subscribe, store.get, store.get);
  return [value, store.set];
}

export function useTinyStoreStorage<T>(key: string, defaultValue: T) {
  const store = useMemo(
    () => createTinyStoreWithStorage(key, defaultValue),
    [key],
  );
  return useTinyStore(store);
}
