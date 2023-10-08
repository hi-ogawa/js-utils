import type { FC } from "../helper/common";
import { type VNode, emptyNode } from "../virtual-dom";

interface Context<T> {
  Provider: FC<{ value: T; children?: VNode }>;
}

const contextMap = new WeakMap<object, unknown>();
contextMap.set;
contextMap.delete;

// beforeRender
// afterRender

// wrapRenderr

// callbacks
// Plugins

// Q. how to pass during `updateCustomNode`?

export function createContext<T>(_defaultValue: T): Context<T> {
  const Provider: FC<{ value: T; children?: VNode }> = (props) => {
    // pushContext?
    props.value;

    let stack = RenderContextManager.contexts.get(context);
    if (!stack) {
      stack = [];
      RenderContextManager.contexts.set(context, stack);
    }
    stack.push(props.value);
    // stack[stack.length - 1];

    return props.children ?? emptyNode();
  };

  const context = { Provider };

  return context;
}

// wrap
// wrapChild

// internal use to implement Provider
export function useContextWriter<T>(_context: Context<T>): (v: T) => void {
  return (value: T) => {
    value;
  };
}

export function useContext<T>(_context: Context<T>): T | undefined {
  throw "todo";
}

export class RenderContextManager {
  // stack of contex values for each context
  static contexts = new WeakMap<object, unknown[]>();

  static wrapCustomRender<T>(f: () => T) {
    try {
      return f();
    } finally {
    }
  }

  static wrapReconcileChild<T>(f: () => T) {
    try {
      return f();
    } finally {
    }
  }
}
