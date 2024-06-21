const MANAGER_KEY = Symbol.for("tiny-refresh.manager");

export interface ViteHot {
  accept: (onNewModule: (newModule?: unknown) => void) => void;
  invalidate: (message?: string) => void;
  data: {
    [MANAGER_KEY]?: Manager;
  };
}

type FC = (props: any) => unknown;

interface Runtime {
  createElement: (...args: any[]) => unknown;
  useReducer: (reducer: (...args: any[]) => any, init: unknown) => [any, any];
  useEffect: (effect: () => void, deps?: unknown[]) => void;
}

interface ProxyEntry {
  Component: FC;
  listeners: Set<() => void>;
}

interface ComponentEntry {
  Component: FC;
  key: string;
}

// singleton per file
export class Manager {
  public proxyMap = new Map<string, ProxyEntry>();
  public componentMap = new Map<string, ComponentEntry>();

  constructor(
    public options: {
      hot: ViteHot;
      runtime: Runtime;
      debug?: boolean;
    }
  ) {}

  wrap(name: string, Component: FC, key: string): FC {
    this.componentMap.set(name, { Component, key });
    let proxy = this.proxyMap.get(name);
    if (!proxy) {
      proxy = createProxyComponent(this, name);
      this.proxyMap.set(name, proxy);
    }
    return proxy.Component;
  }

  setup() {
    // https://vitejs.dev/guide/api-hmr.html#hot-accept-cb
    this.options.hot.accept((newModule) => {
      const ok = newModule && this.patch();
      if (!ok) {
        this.options.hot.invalidate();
      }
    });
  }

  patch() {
    // TODO: debounce re-rendering?
    const componentNames = new Set([
      ...this.proxyMap.keys(),
      ...this.componentMap.keys(),
    ]);
    for (const name of componentNames) {
      const proxy = this.proxyMap.get(name);
      const current = this.componentMap.get(name);
      if (!proxy || !current) {
        return false;
      }
      if (this.options.debug) {
        console.debug(
          `[tiny-refresh] refresh '${name}' (key = ${current.key}, listeners.size = ${proxy.listeners.size})`
        );
      }
      for (const setState of proxy.listeners) {
        setState();
      }
    }
    return true;
  }
}

export function createManager(
  hot: ViteHot,
  runtime: Runtime,
  debug?: boolean
): Manager {
  return (hot.data[MANAGER_KEY] ??= new Manager({ hot, runtime, debug }));
}

function createProxyComponent(manager: Manager, name: string): ProxyEntry {
  const { createElement, useEffect, useReducer } = manager.options.runtime;

  const listeners = new Set<() => void>();

  const Component: FC = (props) => {
    const data = manager.componentMap.get(name);

    const [, forceUpdate] = useReducer((prev) => !prev, true);

    useEffect(() => {
      listeners.add(forceUpdate);
      return () => {
        listeners.delete(forceUpdate);
      };
    }, []);

    if (!data) {
      return `!!! [tiny-refresh] not found '${name}' !!!`;
    }

    // directly calls into functional component
    // and use it as implementation of `InnerComponent`.
    // We change `key` when hook count changes to make it remount.
    return createElement(InnerComponent, { key: data.key, data, props });
  };

  const InnerComponent: FC = (props: { data: ComponentEntry; props: any }) =>
    props.data.Component(props.props);

  // patch Function.name for react error stacktrace
  Object.defineProperty(Component, "name", { value: `${name}@refresh` });
  Object.defineProperty(InnerComponent, "name", { value: name });

  return { Component, listeners };
}
