import React from "react";
import type { SimpleStore } from "./core";

export function useSimpleStore<T, IsReadonly extends boolean>(
  store: SimpleStore<T, IsReadonly>
) {
  React.useSyncExternalStore(store.subscribe, store.get, store.get);
  return [store.get(), store.set] as const;
}
