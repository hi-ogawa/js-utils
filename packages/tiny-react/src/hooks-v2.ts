import { tinyassert } from "@hiogawa/utils";

type HookState = ReducerHookState | EffectHookState;

type ReducerHookState = {
  type: "reducer";
  state: unknown;
};

// TODO
type EffectHookState = {
  type: "effect";
  effect: EffectFn;
  deps?: unknown[];
  cleanup?: () => void;
};

type EffectFn = () => (() => void) | void;

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

    // TODO: handle deps
    tinyassert(hook.deps?.length === deps?.length);
    if (!this.initial && !(hook.deps && deps && isEqualShallow(hook.deps, deps))) {
      // cleanup old effect
    }

    function runEffect() {
      const cleanup = hook.effect();
      if (cleanup) {
        hook.cleanup = cleanup;
      }
    }
  };
}

export const useState = lazyExpose(() => {
  tinyassert(HookContext.current);
  return HookContext.current.useState;
});

export const useReducer = lazyExpose(() => {
  tinyassert(HookContext.current);
  return HookContext.current.useReducer;
});

function lazyExpose<F extends (...args: any[]) => any>(getF: () => F): F {
  return new Proxy(() => {}, {
    apply(_target, thisArg, argArray) {
      return getF().apply(thisArg, argArray);
    },
  }) as F;
}

function isEqualShallow(xs: unknown[], ys: unknown[]) {
  return xs.length === ys.length && xs.every((x, i) => x === ys[i])
}
