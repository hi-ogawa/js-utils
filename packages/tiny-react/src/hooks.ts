import { tinyassert } from "@hiogawa/utils";

// not particularly intentional but this hook module doesn't depend on any of reconciler/virtual-dom logic,
// which tells that the hook idea itself is a general concept applicable to functional api...?

type HookState = ReducerHookState | EffectHookState;

type ReducerHookState = {
  type: "reducer";
  state: unknown;
};

type EffectType = "layout-effect" | "effect";

type EffectHookState = {
  type: EffectType;
  deps?: unknown[];
  // when synchronously rendering multiple times,
  // multiple effects could accumulate since `useEffect` is asynchronous.
  pendings: PendingEffect[];
};

type PendingEffect = {
  effect?: EffectFn;
  cleanup?: (() => void) | void;
};

type EffectFn = () => (() => void) | void;

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
        hook.pendings.forEach((pending, i) => {
          if (pending.effect) {
            tinyassert(!pending.cleanup);
            pending.cleanup = pending.effect();
            pending.effect = undefined;
          }
          // also consume "cleanup" except the last effect
          if (i < hook.pendings.length - 1) {
            if (pending.cleanup) {
              pending.cleanup();
            }
          }
        });
        hook.pendings = hook.pendings.slice(-1);
      }
    }
  }

  cleanupEffect(type: EffectType) {
    for (const hook of this.hooks) {
      if (hook.type === type) {
        for (const pending of hook.pendings) {
          if (pending.cleanup) {
            pending.cleanup();
          }
        }
        hook.pendings = [];
      }
    }
  }

  //
  // hook api
  //

  useReducer = <S, A>(
    reducer: (prevState: S, action: A) => S,
    initialState: InitialState<S>
  ): [S, (action: A) => void] => {
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
    const dispatch = (action: A) => {
      const nextState = reducer(hook.state as S, action);
      if (hook.state !== nextState) {
        hook.state = nextState;
        this.notify();
      }
    };
    return [state, dispatch];
  };

  useEffect = (type: EffectType, effect: EffectFn, deps?: unknown[]) => {
    // init hook state
    if (this.initial) {
      this.hooks.push({
        type,
        deps,
        pendings: [{ effect }],
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
      hook.deps = deps;
      hook.pendings.push({ effect });
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
