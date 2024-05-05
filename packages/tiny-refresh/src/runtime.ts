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

// cf. https://github.com/solidjs/solid-refresh/blob/22d6a92c91013b6e5d71e520a3d1dcb47d491bba/src/runtime/index.ts
export interface ViteHot {
  data: HotData;
  accept: (onNewModule: (newModule?: unknown) => void) => void;
  invalidate: (message?: string) => void;
}

interface WebpackHot {
  data?: HotData;
  accept: (cb?: () => void) => void;
  dispose: (cb: (data: HotData) => void) => void;
  invalidate: () => void;
}

interface HotData {
  [REGISTRY_KEY]?: HmrRegistry;
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
  // TODO: remove
  remount: boolean;
  key?: string;
}

export function createHmrComponent(
  registry: HmrRegistry,
  name: string,
  Fc: ReactTypes.FC,
  options: HmrComponentOptions
) {
  registry.componentMap.set(name, {
    component: Fc,
    listeners: new Set(),
    options,
  });

  const { createElement, useEffect, useReducer } = registry.runtime;

  const WrapperFc: ReactTypes.FC = (props) => {
    const data = (registry.initial ?? registry).componentMap.get(name);

    const forceUpdate = useReducer<boolean, void>(
      (prev: boolean) => !prev,
      true
    )[1];

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

    //
    // approach 1.
    //
    //   createElement(fc, props)
    //
    //   This renders component as a child, which makes it always re-mount on hot update since two functions are not identical.
    //   Hook states are not preserved, but new component can add/remove hook usage since hook states reset anyways.
    //
    // approach 2.
    //
    //   fc(props)
    //
    //   This directly calls into functional component and use it as implementation of `UnsafeWrapperFc`.
    //   This won't cause re-mount but it must ensure hook usage didn't change, otherwise it'll crash client.
    //   Ideally, to employ this approach, we need to detect the usage of hook and force remount when hook usage is changed.
    //   For now, however, we allow this mode via explicit "// @hmr-unsafe" comment.
    //

    return data.options.remount
      ? createElement(data.component, props)
      : createElement(UnsafeWrapperFc, {
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
  Object.defineProperty(WrapperFc, "name", { value: `${name}_refresh` });
  Object.defineProperty(UnsafeWrapperFc, "name", {
    value: `${name}_refresh_unsafe`,
  });

  return WrapperFc;
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
    const skip = initial.component.toString() === latest.component.toString();

    // sync "latest" to "initial"
    initial.component = latest.component;
    initial.options = latest.options;

    if (skip) {
      continue;
    }

    // TODO: debounce re-rendering
    if (latestReg.debug) {
      // cf. "[vite] hot updated" log https://github.com/vitejs/vite/pull/8855
      console.debug(
        `[tiny-refresh] refresh '${key}' (remount = ${initial.options.remount}, listeners.size = ${initial.listeners.size})`
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

export function setupHmrWebpack(hot: WebpackHot, registry: HmrRegistry) {
  // perspective flips for webpack since `hot.data` is passed by old module.
  const lastRegistry = hot.data && hot.data[REGISTRY_KEY];
  if (lastRegistry) {
    const patchSuccess = patchRegistry(lastRegistry, registry);
    if (!patchSuccess) {
      hot.invalidate();
    }
  }

  // https://webpack.js.org/api/hot-module-replacement/#dispose-or-adddisposehandler
  hot.dispose((data) => {
    data[REGISTRY_KEY] = registry;
  });
  hot.accept();
}
