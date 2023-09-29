import { tinyassert } from "@hiogawa/utils";

type HookState = ReducerHookState | EffectHookState | RefHookState;

type ReducerHookState = {
  type: "reducer";
  state: unknown;
};

type RefHookState = {
  type: "ref";
  ref: { current: unknown };
};

type EffectHookState = {
  type: "effect";
  effect?: EffectFn;
  deps?: unknown[];
  cleanup?: () => void;
};

type EffectFn = () => (() => void) | void;

function runEffect(hook: EffectHookState) {
  if (hook.effect) {
    // cleanup last effect only when there is a new effect
    if (hook.cleanup) {
      hook.cleanup();
      hook.cleanup = undefined;
    }
    hook.cleanup = hook.effect() ?? undefined;
    hook.effect = undefined;
  }
}

function cleanupEffect(hook: EffectHookState) {
  if (hook.cleanup) {
    hook.cleanup();
    hook.cleanup = undefined;
  }
}

export class HookContext {
  // expose global
  static current: HookContext | undefined;

  private initial = true;
  private hookCount = 0;
  private hooks: HookState[] = [];

  constructor(private notify: () => void) {}

  wrap<T>(f: () => T): T {
    HookContext.current = this;
    this.hookCount = 0;
    try {
      return f();
    } finally {
      this.initial = false;
      HookContext.current = undefined!;
    }
  }

  runEffect() {
    for (const hook of this.hooks) {
      if (hook.type === "effect") {
        runEffect(hook);
      }
    }
  }

  cleanupEffect() {
    for (const hook of this.hooks) {
      if (hook.type === "effect") {
        cleanupEffect(hook);
      }
    }
  }

  //
  // hook api
  //

  useState = <T>(initialState: T) => {
    return this.useReducer<T, T>((_prev, next) => next, initialState);
  };

  useReducer = <S, A>(
    reducer: (prevState: S, action: A) => S,
    initialState: S
  ) => {
    // init hook state
    if (this.initial) {
      this.hooks.push({
        type: "reducer",
        state: initialState,
      });
    }
    const hookToCheck = this.hooks[this.hookCount++];
    tinyassert(hookToCheck.type === "reducer");
    const hook = hookToCheck;

    // reducer
    const state = hook.state as S;
    const dispatch = (next: A) => {
      hook.state = reducer(state, next);
      this.notify();
    };
    return [state, dispatch] as const;
  };

  useRef = <T>(initialState: T) => {
    // init hook state
    if (this.initial) {
      this.hooks.push({
        type: "ref",
        ref: { current: initialState },
      });
    }
    const hook = this.hooks[this.hookCount++];
    tinyassert(hook.type === "ref");
    return hook.ref as { current: T };
  };

  useMemo = <T>(callback: () => T, deps: unknown[]) => {
    const ref = this.useRef({
      deps,
      value: undefined as T,
    });
    if (this.initial || !isEqualShallow(ref.current.deps, deps)) {
      ref.current.value = callback();
    }
    return ref.current.value;
  };

  useCallback = <F extends (...args: any[]) => any>(
    callback: F,
    deps: unknown[]
  ) => {
    return this.useMemo(() => callback, deps);
  };

  useEffect = (effect: EffectFn, deps?: unknown[]) => {
    // init hook state
    if (this.initial) {
      this.hooks.push({
        type: "effect",
        effect,
        deps,
      });
    }
    const hookToCheck = this.hooks[this.hookCount++];
    tinyassert(hookToCheck.type === "effect");
    const hook = hookToCheck;

    tinyassert(hook.deps?.length === deps?.length);
    if (
      !this.initial &&
      !(hook.deps && deps && isEqualShallow(hook.deps, deps))
    ) {
      // last effect should've been already done
      tinyassert(!hook.effect);
      hook.effect = effect;
    }
  };
}

export const useState = /* @__PURE__ */ defineHook((ctx) => ctx.useState);
export const useReducer = /* @__PURE__ */ defineHook((ctx) => ctx.useReducer);
export const useRef = /* @__PURE__ */ defineHook((ctx) => ctx.useRef);
export const useEffect = /* @__PURE__ */ defineHook((ctx) => ctx.useEffect);
export const useMemo = /* @__PURE__ */ defineHook((ctx) => ctx.useMemo);
export const useCallback = /* @__PURE__ */ defineHook((ctx) => ctx.useCallback);

function defineHook<T>(implement: (ctx: HookContext) => T): T {
  return new Proxy(() => {}, {
    apply(_target, ...args) {
      tinyassert(HookContext.current);
      return Reflect.apply(implement(HookContext.current) as any, ...args);
    },
  }) as T;
}

function isEqualShallow(xs: unknown[], ys: unknown[]) {
  return xs.length === ys.length && xs.every((x, i) => x === ys[i]);
}
