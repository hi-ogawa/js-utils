import React from "react";
import type { SimpleStore } from "./core";

export function useSimpleStore<TOut, TIn>(store: SimpleStore<TOut, TIn>) {
  React.useSyncExternalStore(store.subscribe, store.get, store.get);
  return [store.get(), store.set] as const;
}
