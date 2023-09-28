import { tinyassert } from "@hiogawa/utils";

type HookState = ReducerHookState | EffectHookState;

type ReducerHookState = {
  type: "reducer";
  state: unknown;
};

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
    if (this.initial) {
      this.hooks.push({
        type: "reducer",
        state: initialState,
      });
    }
    const hookToCheck = this.hooks[this.hookCount++];
    tinyassert(hookToCheck.type === "reducer");
    const hook = hookToCheck;

    const state = hook.state as T;
    const setState = (next: T) => {
      hook.state = next;
      this.notify();
    };
    return [state, setState] as const;
  };
}

export const useState = expose(() => {
  tinyassert(HookContext.current);
  return HookContext.current.useState;
});

function expose<F extends (...args: any[]) => any>(getF: () => F): F {
  return new Proxy(() => {}, {
    apply(_target, thisArg, argArray) {
      return getF().apply(thisArg, argArray);
    },
  }) as F;
}
