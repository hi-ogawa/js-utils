import { tinyassert } from "@hiogawa/utils";
import {
  type Context,
  type ContextKey,
  type ContextMap,
  EMPTY_NODE,
  type FC,
  type VNode,
} from "./virtual-dom";

export function createContext<T>(defaultValue: T): Context<T> {
  const key: ContextKey = {};

  const Provider: FC<{ value: T; children?: VNode }> = (props) => {
    RenderContextManager.push(key, props.value);
    return props.children ?? EMPTY_NODE;
  };

  return { key, Provider, defaultValue };
}

export function useContext<T>(context: Context<T>): T {
  // we don't have to setup "force update"
  // since if Provider.value changes, then it means Provider re-render all children
  // including the one using this `useContext`
  // unless we have "memo" component?
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
    // copy-on-write but O((number of contexts)^2) in total perf. it seems alright though
    // https://github.com/preactjs/preact/blob/4b1a7e9276e04676b8d3f8a8257469e2f732e8d4/src/diff/index.js#L222-L224
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
