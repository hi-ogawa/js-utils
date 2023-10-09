import React from "react";

// based on packages/tiny-react/src/hmr/runtime.ts

const REGISTRY_KEY = Symbol.for("tiny-refresh.react");

// cf. https://github.com/solidjs/solid-refresh/blob/22d6a92c91013b6e5d71e520a3d1dcb47d491bba/src/runtime/index.ts
interface ViteHot {
  data: HotData;
  accept: (onNewModule: (newModule?: unknown) => void) => void;
  invalidate: () => void;
}

interface WebpackHot {
  data: HotData;
  accept: (cb?: () => void) => void;
  dispose: (cb: (data: HotData) => void) => void;
  invalidate: () => void;
}

interface HotData {
  [REGISTRY_KEY]?: HmrRegistry;
}

interface HmrRegistry {
  components: Map<string, HmrComponentData>;
}

interface HmrComponentData {
  component: React.FC;
  listeners: Set<(fc: () => React.FC) => void>;
  options: HmrComponentOptions;
}

export function createHmrRegistry(): HmrRegistry {
  return {
    components: new Map(),
  };
}

interface HmrComponentOptions {
  remount: boolean;
}

export function createHmrComponent(
  registry: HmrRegistry,
  Fc: React.FC,
  options: HmrComponentOptions
) {
  const hmrData: HmrComponentData = {
    component: Fc,
    listeners: new Set(),
    options,
  };
  registry.components.set(Fc.name, hmrData);

  // TODO: forward ref?
  const WrapperComponent: React.FC = (props) => {
    const [LatestFc, setFc] = React.useState<React.FC>(() => Fc);

    React.useEffect(() => {
      // expose setter to force update
      hmrData.listeners.add(setFc);
      return () => {
        hmrData.listeners.delete(setFc);
      };
    }, []);

    return options.remount
      ? React.createElement(LatestFc, props)
      : LatestFc(props);
  };

  return WrapperComponent;
}

function patchRegistry(currentReg: HmrRegistry, latestReg: HmrRegistry) {
  const keys = new Set([
    ...currentReg.components.keys(),
    ...latestReg.components.keys(),
  ]);
  for (const key of keys) {
    const current = currentReg.components.get(key);
    const latest = latestReg.components.get(key);
    if (!current || !latest) {
      return false;
    }
    if (current === latest) {
      continue;
    }
    if (current.options.remount !== latest.options.remount) {
      return false;
    }
    currentReg.components.set(key, latest);
    latest.listeners = current.listeners;
    if (latest.listeners) {
      latest.listeners.forEach((f) => f(() => latest.component));
    }
  }
  return true;
}

export function setupHmrVite(hot: ViteHot, registry: HmrRegistry) {
  hot.data[REGISTRY_KEY] = registry;
  // https://vitejs.dev/guide/api-hmr.html#hot-accept-cb
  hot.accept((newModule) => {
    // `registry` refereneced here is the one from the last module which is "accept"-ing new modules.
    // `hot.data[LATEST_DATA]` is always updated by new module before new module is "accept"-ed.
    const latestRegistry = hot.data[REGISTRY_KEY];
    const patchSuccess =
      newModule && latestRegistry && patchRegistry(registry, latestRegistry);
    if (!patchSuccess) {
      hot.invalidate();
    }
  });
}

export function setupHmrWebpack(hot: WebpackHot, registry: HmrRegistry) {
  // "perspective" flips for webpack as `hot.data` is passed by old module.
  const lastRegistry = hot.data[REGISTRY_KEY];
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
