// inline minimal react typing
namespace ReactTypes {
  export type FC = (props: any) => unknown;
  export type createElement = (...args: any[]) => unknown;
  export type useReducer = <S, A>(
    reducer: (prevState: S, action: A) => S,
    initialState: S
  ) => [S, (action: A) => void];
  export type useEffect = (effect: () => void, deps?: unknown[]) => void;
}

const REGISTRY_KEY = Symbol.for("tiny-refresh.react");
const INITIAL_REGISTRY_KEY = Symbol.for("tiny-refresh.registry");

// cf. https://github.com/solidjs/solid-refresh/blob/22d6a92c91013b6e5d71e520a3d1dcb47d491bba/src/runtime/index.ts
export interface ViteHot {
  data: HotData;
  accept: (onNewModule: (newModule?: unknown) => void) => void;
  invalidate: (message?: string) => void;
}

interface HotData {
  [REGISTRY_KEY]?: HmrRegistry;
  [INITIAL_REGISTRY_KEY]?: HmrRegistry;
}

interface HmrRegistry {
  runtime: {
    createElement: ReactTypes.createElement;
    useReducer: ReactTypes.useReducer;
    useEffect: ReactTypes.useEffect;
  };
  componentMap: Map<string, HmrComponentData>;
  debug?: boolean; // to hide log for testing
  // each HmrRegistry references initial registry (except initial module itself)
  // as we keep all following changes reflected to the initial registry.
  initial?: HmrRegistry;
}

interface HmrComponentData {
  component: ReactTypes.FC;
  listeners: Set<() => void>;
  options: HmrComponentOptions;
  WrapperFc: ReactTypes.FC;
}

export function createHmrRegistry(
  runtime: HmrRegistry["runtime"],
  debug?: boolean
): HmrRegistry {
  return {
    runtime,
    debug,
    componentMap: new Map(),
  };
}

interface HmrComponentOptions {
  key?: string;
}

export function createHmrComponent(
  registry: HmrRegistry,
  name: string,
  Fc: ReactTypes.FC,
  options: HmrComponentOptions,
  hot: ViteHot
) {
  const { createElement, useEffect, useReducer } = registry.runtime;

  const WrapperFc: ReactTypes.FC = (props) => {
    // TODO
    // check if this is in render context,
    // so that we can bail out as a normal function?

    const data = (registry.initial ?? registry).componentMap.get(name);

    const [, forceUpdate] = useReducer<boolean, void>(
      (prev: boolean) => !prev,
      true
    );

    useEffect(() => {
      if (!data) {
        return;
      }
      // expose "force update" to registry
      data.listeners.add(forceUpdate);
      return () => {
        data.listeners.delete(forceUpdate);
      };
    }, []);

    if (!data) {
      return `!!! [tiny-refresh] missing '${name}' !!!`;
    }

    // This directly calls into functional component and use it as implementation of `UnsafeWrapperFc`.
    // We change `key` when hook count changes so that it will remount.
    return createElement(UnsafeWrapperFc, {
      key: data.options.key,
      data,
      props,
    });
  };

  const UnsafeWrapperFc: ReactTypes.FC = ({
    data,
    props,
  }: {
    data: HmrComponentData;
    props: any;
  }) => {
    return data.component(props);
  };

  // patch Function.name for react error stacktrace
  Object.defineProperty(WrapperFc, "name", { value: `${name}@refresh` });
  Object.defineProperty(UnsafeWrapperFc, "name", { value: name });

  const WrapperFc2 =
    hot.data[INITIAL_REGISTRY_KEY]?.componentMap.get(name)?.WrapperFc ??
    WrapperFc;

  registry.componentMap.set(name, {
    component: Fc,
    listeners: new Set(),
    options,
    WrapperFc: WrapperFc2,
  });

  return WrapperFc2;
  // return WrapperFc;
}

function patchRegistry(currentReg: HmrRegistry, latestReg: HmrRegistry) {
  const keys = new Set([
    ...currentReg.componentMap.keys(),
    ...latestReg.componentMap.keys(),
  ]);

  // pass reference to initial registry
  const initialReg = currentReg.initial ?? currentReg;
  latestReg.initial = initialReg;

  for (const key of keys) {
    const initial = initialReg.componentMap.get(key);
    const latest = latestReg.componentMap.get(key);
    if (!initial || !latest) {
      return false;
    }

    // Skip re-rendering if function code is exactly same.
    // Note that this can cause "false-negative", for example,
    // when a constant defined in the same file has changed
    // and such constant is used by the component.
    // TODO: instead of completely skipping, we could still render with "unsafe" mode since no change in component implies there's no hook change.
    // const skip = initial.component.toString() === latest.component.toString();

    // sync "latest" to "initial"
    initial.component = latest.component;
    initial.options = latest.options;

    // if (skip) {
    //   continue;
    // }

    // TODO: debounce re-rendering
    if (latestReg.debug) {
      console.debug(
        `[tiny-refresh] refresh '${key}' (key = ${latest.options.key}, listeners.size = ${initial.listeners.size})`
      );
    }
    for (const setState of initial.listeners) {
      setState();
    }
  }
  return true;
}

export function setupHmrVite(hot: ViteHot, registry: HmrRegistry) {
  hot.data[REGISTRY_KEY] = registry;
  hot.data[INITIAL_REGISTRY_KEY] ??= registry;

  // https://vitejs.dev/guide/api-hmr.html#hot-accept-cb
  hot.accept((newModule) => {
    // `registry` refereneced here is the one from the last module which is "accept"-ing new modules.
    // `hot.data[REGISTRY_KEY]` is always updated by new module before new module is "accept"-ed.
    const latestRegistry = hot.data[REGISTRY_KEY];
    const patchSuccess =
      newModule && latestRegistry && patchRegistry(registry, latestRegistry);
    if (!patchSuccess) {
      hot.invalidate();
    }
  });
}
