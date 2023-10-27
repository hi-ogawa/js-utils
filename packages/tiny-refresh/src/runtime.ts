// inline minimal react typing
namespace ReactTypes {
  export type FC = (props: any) => unknown;
  export type createElement = (...args: any[]) => unknown;
  export type useState = <T>(
    init: T | (() => T)
  ) => [T, (next: T | ((prev: T) => T)) => void];
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
    useState: ReactTypes.useState;
    useEffect: ReactTypes.useEffect;
  };
  debug?: boolean; // to hide log for testing
  componentMap: Map<string, HmrComponentData>;
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
  remount: boolean;
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

  const { createElement, useEffect, useState } = registry.runtime;

  const WrapperFc: ReactTypes.FC = (props) => {
    const current = registry.componentMap.get(name);

    const [_state, setState] = useState(true);

    useEffect(() => {
      if (!current) {
        return;
      }
      // expose "force update" to registry
      const forceUpdate = () => setState((prev) => !prev);
      current.listeners.add(forceUpdate);
      return () => {
        current.listeners.delete(forceUpdate);
      };
    }, []);

    if (!current) {
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

    return current.options.remount
      ? createElement(current.component, props)
      : createElement(UnsafeWrapperFc, {
          current,
          props,
        });
  };

  const UnsafeWrapperFc: ReactTypes.FC = ({
    current,
    props,
  }: {
    current: HmrComponentData;
    props: any;
  }) => {
    return current.component(props);
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

  // TODO(refactor): probably we could simplify by separating "collecting" registry (for each run) and "shared" registry (the one from initial module)?

  // holds latest component collected during this update
  const latestComponentMap = latestReg.componentMap;

  // share single initial componentMap between all registry
  latestReg.componentMap = currentReg.componentMap;

  for (const key of keys) {
    const current = currentReg.componentMap.get(key);
    const latest = latestComponentMap.get(key);
    if (!current || !latest) {
      return false;
    }

    // Skip re-rendering if function code is exactly same.
    // Note that this can cause "false-negative", for example,
    // when a constant defined in the same file has changed
    // and such constant is used by the component.
    // TODO: instead of completely skipping, we could still render with "unsafe" mode since no change in component implies there's no hook change.
    const skip = current.component.toString() === latest.component.toString();

    // sync "current"
    current.component = latest.component;
    current.options = latest.options;

    if (skip) {
      continue;
    }

    // TODO: debounce re-rendering
    if (latestReg.debug) {
      // cf. "[vite] hot updated" log https://github.com/vitejs/vite/pull/8855
      console.debug(
        `[tiny-refresh] refresh '${key}' (remount = ${current.options.remount}, listeners.size = ${current.listeners.size})`
      );
    }
    for (const setState of current.listeners) {
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
    const patchSuccess = lastRegistry && patchRegistry(lastRegistry, registry);
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
