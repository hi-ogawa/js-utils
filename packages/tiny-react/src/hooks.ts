import { tinyassert } from "@hiogawa/utils";

// not particularly intentional but this hook module doesn't depend on any of reconciler/virtual-dom logic,
// which tells that the hook idea itself is a general concept applicable to functional api...?

type HookState = ReducerHookState | EffectHookState;

type ReducerHookState = {
  type: "reducer";
  state: unknown;
};

type EffectType = "layout-effect" | "effect";

// TODO: need to accumulate multiple effects for single hook
//       since `useEffect` can run multiple times before the first effect runs asynchrnously
type EffectHookState = {
  type: EffectType;
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
    const effect = hook.effect;
    hook.cleanup = effect() ?? undefined;
    hook.effect = undefined;
  }
}

function cleanupEffect(hook: EffectHookState) {
  if (hook.cleanup) {
    hook.cleanup();
    hook.cleanup = undefined;
  }
}

type InitialState<T> = T | (() => T);

type NextState<T> = T | ((prev: T) => T);

function resolveNextState<T>(prev: T, next: NextState<T>): T {
  // cannot narrow since `T` could be a function
  return typeof next === "function" ? (next as any)(prev) : next;
}

//
// hook context (instantiated for each BCustom.hookContext)
//

export class HookContext {
  // expose global
  // (technically we can keep stack HookContext[] so that HookContext.wrap can be reentrant)
  static current: HookContext | undefined;

  private initial = true;
  private hookCount = 0;
  private hooks: HookState[] = [];

  // reconciler use `notify` for "force update"
  constructor(public notify: () => void) {}

  wrap<T>(f: () => T): T {
    tinyassert(!HookContext.current, "hook reentrance?");
    HookContext.current = this;
    this.hookCount = 0;
    try {
      return f();
    } finally {
      this.initial = false;
      tinyassert(HookContext.current);
      HookContext.current = undefined!;
    }
  }

  runEffect(type: EffectType) {
    for (const hook of this.hooks) {
      if (hook.type === type) {
        runEffect(hook);
      }
    }
  }

  cleanupEffect(type: EffectType) {
    for (const hook of this.hooks) {
      if (hook.type === type) {
        cleanupEffect(hook);
      }
    }
  }

  //
  // hook api
  //

  useReducer = <S, A>(
    reducer: (prevState: S, action: A) => S,
    initialState: InitialState<S>
  ) => {
    // init hook state
    if (this.initial) {
      this.hooks.push({
        type: "reducer",
        state: resolveNextState(undefined!, initialState),
      });
    }
    const hook = this.hooks[this.hookCount++];
    tinyassert(hook.type === "reducer");

    // reducer
    const state = hook.state as S;
    const dispatch = (next: A) => {
      const nextState = reducer(hook.state as S, next);
      if (hook.state !== nextState) {
        hook.state = nextState;
        this.notify();
      }
    };
    return [state, dispatch] as const;
  };

  useEffect = (type: EffectType, effect: EffectFn, deps?: unknown[]) => {
    // init hook state
    if (this.initial) {
      this.hooks.push({
        type,
        effect,
        deps,
      });
    }
    const hook = this.hooks[this.hookCount++];
    tinyassert(hook.type === type);

    // queue effect
    tinyassert(hook.deps?.length === deps?.length);
    if (
      !this.initial &&
      !(hook.deps && deps && isEqualShallow(hook.deps, deps))
    ) {
      // Last effect should've been already done.
      // Otherwise, it's likely effect itself caused "force update", which is not currently supported.
      tinyassert(!hook.effect, "repeated render caused by useEffect?");
      hook.effect = effect;
      hook.deps = deps;
    }
  };
}

//
// core hooks
//

export const useReducer = /* @__PURE__ */ defineHook((ctx) => ctx.useReducer);
const useEffectInner = /* @__PURE__ */ defineHook((ctx) => ctx.useEffect);

//
// hooks implemented based on core hooks
//

export function useLayoutEffect(effect: EffectFn, deps?: unknown[]) {
  return useEffectInner("layout-effect", effect, deps);
}

export function useEffect(effect: EffectFn, deps?: unknown[]) {
  return useEffectInner("effect", effect, deps);
}

export function useState<T>(initialState: InitialState<T>) {
  return useReducer<T, NextState<T>>(
    (prev, next) => resolveNextState(prev, next),
    initialState
  );
}

export function useRef<T>(initialState: T) {
  return useState(() => ({ current: initialState }))[0];
}

export function useMemo<T>(callback: () => T, deps: unknown[]) {
  const ref = useRef({
    initial: true,
    value: undefined as T,
    deps,
  });
  if (ref.current.initial || !isEqualShallow(ref.current.deps, deps)) {
    ref.current.initial = false;
    ref.current.value = callback();
    ref.current.deps = deps;
  }
  return ref.current.value;
}

export function useCallback<F extends (...args: any[]) => any>(
  callback: F,
  deps: unknown[]
) {
  return useMemo(() => callback, deps);
}

//
// utils
//

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
