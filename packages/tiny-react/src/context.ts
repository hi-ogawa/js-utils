import { tinyassert } from "@hiogawa/utils";
import {
  type Context,
  type ContextKey,
  type ContextMap,
  type FC,
  type VNode,
  emptyNode,
} from "./virtual-dom";

export function createContext<T>(defaultValue: T): Context<T> {
  const key: ContextKey = {};

  const Provider: FC<{ value: T; children?: VNode }> = (props) => {
    RenderContextManager.push(key, props.value);
    return props.children ?? emptyNode();
  };

  return { key, Provider, defaultValue };
}

export function useContext<T>(context: Context<T>): T {
  return RenderContextManager.get(context);
}

export class RenderContextManager {
  static current: ContextMap | undefined;

  static get<T>(context: Context<T>): T {
    tinyassert(this.current);
    if (this.current.has(context.key)) {
      return this.current.get(context.key) as any;
    }
    return context.defaultValue;
  }

  static push(key: ContextKey, value: unknown) {
    tinyassert(this.current);
    // TODO: copy-on-write but O((number of contexts)^2) perf is probably not what react does.
    this.current = new Map(this.current);
    this.current.set(key, value);
  }

  static wrap<T>(map: ContextMap, f: () => T): [T, ContextMap] {
    tinyassert(!this.current);
    this.current = map;
    try {
      const result = f();
      return [result, this.current];
    } finally {
      tinyassert(this.current);
      this.current = undefined;
    }
  }
}
