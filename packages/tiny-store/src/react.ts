import React from "react";
import type { TinyStoreApi } from "./core";

export function useTinyStore<T, IsReadonly extends boolean>(
  store: TinyStoreApi<T, IsReadonly>
) {
  React.useSyncExternalStore(store.subscribe, store.get, store.get);
  return [store.get(), store.set] as const;
}
