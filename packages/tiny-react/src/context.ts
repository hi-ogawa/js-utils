import { tinyassert } from "@hiogawa/utils";
import { useEffect, useReducer, useState } from "./hooks";
import {
  type ComponentChildren,
  type Context,
  type ContextKey,
  type ContextMap,
  ContextStore,
  type FC,
  normalizeComponentChildren,
} from "./virtual-dom";

export function createContext<T>(defaultValue: T): Context<T> {
  const key: ContextKey = {};

  const Provider: FC<{ value: T; children?: ComponentChildren }> = (props) => {
    const [store] = useState(() => new ContextStore(props.value));

    // synchronize at render time
    RenderContextManager.push(key, store);
    store.value = props.value;

    // "force update" (by notifying decendent useContext) is necessary, for example, for "memo" component.
    // but for common case, this will probably lead to somewhat redundant rendering.
    useEffect(() => {
      if (store.initial) {
        store.initial = false;
      } else {
        store.notify();
      }
    }, [props.value]);

    // do same as Fragment
    return normalizeComponentChildren(props.children);
  };

  const context: Context<T> = { key, Provider, defaultValue };
  return context;
}

export function useContext<T>(context: Context<T>): T {
  const store = RenderContextManager.get(context);

  const forceUpdate = useReducer((prev, _action: void) => !prev, false)[1];

  useEffect(() => {
    return store?.subscribe(forceUpdate);
  }, [store]);

  return store ? store.value : context.defaultValue;
}

export class RenderContextManager {
  static currentMap: ContextMap | undefined;

  static get<T>(context: Context<T>) {
    tinyassert(this.currentMap);
    return this.currentMap.get(context.key);
  }

  static push(key: ContextKey, instance: ContextStore<any>) {
    tinyassert(this.currentMap);
    this.currentMap = new Map(this.currentMap);
    this.currentMap.set(key, instance);
  }

  static wrap<T>(map: ContextMap, f: () => T): [T, ContextMap] {
    tinyassert(!this.currentMap);
    this.currentMap = map;
    try {
      const result = f();
      return [result, this.currentMap];
    } finally {
      tinyassert(this.currentMap);
      this.currentMap = undefined;
    }
  }
}
