import type { FC } from "../helper/common";
import type { h } from "../helper/hyperscript";
import type { useEffect, useState } from "../hooks";

// references
// https://github.com/solidjs/solid-refresh/blob/22d6a92c91013b6e5d71e520a3d1dcb47d491bba/src/runtime/index.ts
// https://vitejs.dev/guide/api-hmr.html

const LATEST_DATA = Symbol.for("tiny-react.hmr");

// cf. import("vite/types/hot")["ViteHotContext"]
export interface HotContext {
  accept: (onNewModule: (newModule: {} | undefined) => void) => void;
  invalidate: () => void;
  data: { [LATEST_DATA]?: HmrRegistry };
}

interface HmrRegistry {
  // avoid directly import runtime and receive from app code
  runtime: {
    h: typeof h;
    useState: typeof useState;
    useEffect: typeof useEffect;
  };
  components: Map<string, HmrComponentData>;
}

interface HmrComponentData {
  component: FC;
  listeners: Set<(fc: () => FC) => void>;
}

export function createHmrRegistry(
  runtime: HmrRegistry["runtime"]
): HmrRegistry {
  return {
    runtime,
    components: new Map(),
  };
}

export function createHmrComponent<P>(registry: HmrRegistry, Fc: FC<P>) {
  const hmrData: HmrComponentData = {
    component: Fc,
    listeners: new Set(),
  };
  registry.components.set(Fc.name, hmrData);

  const WrapperComponent: FC<P> = (props) => {
    // take latest component from registry.
    const [LatestFc, setFc] = registry.runtime.useState<FC>(() => Fc);

    registry.runtime.useEffect(() => {
      // expose setter to force update
      hmrData.listeners.add(setFc);
      return () => {
        hmrData.listeners.delete(setFc);
      };
    }, []);

    //
    // approach 1. (current)
    //
    //   return h(LatestFc, props)
    //
    //   This renders component as a child, which makes it always re-mount on hot update since two functions are not identical.
    //   Hook states are not preserved, but new component can add/remove hook usage since hook states reset anyways.
    //
    // approach 2. (TODO)
    //
    //   return LatestFc(props)
    //
    //   This directly calls into functional component and use it as implementation of `WrapperComponent`.
    //   This won't cause re-mount but it must ensure hook usage didn't change, otherwise it'll crash client.
    //   To employ this approach, we need to detect the usage of hook and conditionally `hot.invalidate`
    //   only when hook usage is changed.
    //

    return registry.runtime.h(LatestFc, props);
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
    currentReg.components.set(key, latest);
    latest.listeners = current.listeners;
    if (latest.listeners) {
      latest.listeners.forEach((f) => f(() => latest.component));
    }
  }
  return true;
}

export function setupHmr(hot: HotContext, registry: HmrRegistry) {
  hot.data[LATEST_DATA] = registry;
  hot.accept((newModule) => {
    // `registry` refereneced here is the one from the last module which is "accept"-ing new modules.
    // `hot.data[LATEST_DATA]` is always updated by new module before new module is "accept"-ed.
    const patchSuccess =
      newModule &&
      hot.data[LATEST_DATA] &&
      patchRegistry(registry, hot.data[LATEST_DATA]);
    if (!patchSuccess) {
      hot.invalidate();
    }
  });
}
