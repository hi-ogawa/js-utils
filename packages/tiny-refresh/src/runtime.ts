import { tinyassert } from "@hiogawa/utils";

// inline minimal react typing
namespace ReactTypes {
  export type FC = (props: any) => any;
  export type createElement = (...args: any[]) => any;
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
  debug?: boolean;
  components: Map<string, HmrComponentData>;
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
    components: new Map(),
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
  const hmrData: HmrComponentData = {
    component: Fc,
    listeners: new Set(),
    options,
  };
  registry.components.set(name, hmrData);
  const { createElement, useEffect, useState } = registry.runtime;

  // const KeyedWrapper: ReactTypes.FC = (props) => {
  //   registry.components.get(name);
  //   // createElement()
  //   // return
  //   // return options.remount ? wrapperProps
  // }

  const WrapperComponent: ReactTypes.FC = (props) => {
    // const [LatestFc, setFc] = useState(() => Fc);
    // LatestFc;

    const [key, setKey] = useState(0);
    key;
    // const forceUpdate = () => setKey((prev) => prev + 1);

    useEffect(() => {
      // expose force update
      const forceUpdate = () => setKey((prev) => prev + 1);
      hmrData.listeners.add(forceUpdate);
      return () => {
        hmrData.listeners.delete(forceUpdate);
      };
    }, []);

    //
    // approach 1.
    //
    //   h(LatestFc, props)
    //
    //   This renders component as a child, which makes it always re-mount on hot update since two functions are not identical.
    //   Hook states are not preserved, but new component can add/remove hook usage since hook states reset anyways.
    //
    // approach 2.
    //
    //   LatestFc(props)
    //
    //   This directly calls into functional component and use it as implementation of `WrapperComponent`.
    //   This won't cause re-mount but it must ensure hook usage didn't change, otherwise it'll crash client.
    //   To employ this approach, we need to detect the usage of hook and conditionally `hot.invalidate`
    //   only when hook usage is changed.
    //   however we allow this mode via explicit "// @hmr-unsafe" comment.
    //

    // get latest component from registry
    const latest = registry.components.get(name);
    tinyassert(latest, `[bug:tiny-refresh] not found '${name}'`);

    return latest.options.remount
      ? createElement(latest.component, props)
      : latest.component(props);

    // return options.remount ? createElement(LatestFc, props) : LatestFc(props);
  };

  return WrapperComponent;
}

function patchRegistry(currentReg: HmrRegistry, latestReg: HmrRegistry) {
  const keys = new Set([
    ...currentReg.components.keys(),
    ...latestReg.components.keys(),
  ]);
  // const updates: (() => void)[] = [];

  for (const key of keys) {
    const current = currentReg.components.get(key);
    const latest = latestReg.components.get(key);
    if (
      !current ||
      !latest ||
      current.options.remount !== latest.options.remount
    ) {
      return false;
    }
    // currentReg.components.set(key, latest);

    // latest.listeners = current.listeners; // copy over listeners from current component

    // Skip re-rendering if function code is exactly same.
    // Note that this can cause "false-negative", for example,
    // when a constant defined in the same file has changed
    // and such constant is used by the component.
    const skip = current.component.toString() === latest.component.toString();
    current.component = latest.component;
    current.options = latest.options;
    if (skip) {
      continue;
    }
    console.log(
      `[tiny-refresh] refresh '${key}' (remount = ${latest.options.remount})`
    );
    for (const listener of current.listeners) {
      listener();
    }
  }
  // pass over whole map so that old module can access latest
  latestReg.components = currentReg.components;
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
      // when child module calls `hot.invalidate()`, it'll propagate to parent module.
      // if such parent module has also `setupHmrVite`, then it will simply self-accept and full window reload will not be triggered.
      // So, probably it would be more pragmatic and significant simplification to start with force full reload here
      // instead of doing `hot.invalidate()` and trying hard to synchronize `registry` and `latestRegistry` somehow.
      console.log(`[tiny-refresh] full reload`);
      window.location.reload();
    }
  });
}

export function setupHmrWebpack(hot: WebpackHot, registry: HmrRegistry) {
  // perspective flips for webpack since `hot.data` is passed by old module.
  const lastRegistry = hot.data && hot.data[REGISTRY_KEY];
  if (lastRegistry) {
    const patchSuccess = lastRegistry && patchRegistry(lastRegistry, registry);
    if (!patchSuccess) {
      console.log(`[tiny-refresh] full reload`);
      window.location.reload();
    }
  }

  // https://webpack.js.org/api/hot-module-replacement/#dispose-or-adddisposehandler
  hot.dispose((data) => {
    data[REGISTRY_KEY] = registry;
  });
  hot.accept();
}
