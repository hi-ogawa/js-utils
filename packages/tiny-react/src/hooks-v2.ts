import { tinyassert } from "@hiogawa/utils";

type HookState = ReducerHookState | EffectHookState;

type ReducerHookState = {
  type: "reducer";
  state: unknown;
};

// TODO
type EffectHookState = {
  type: "effect";
};

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
    // get or create hook state
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
