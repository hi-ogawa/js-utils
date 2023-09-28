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
  private initial = true;
  private hookCount = 0;
  private hooks: HookState[] = [];

  constructor(private notify: () => void) {}

  wrap<T>(f: () => T): T {
    current = this;
    this.hookCount = 0;
    try {
      return f();
    } finally {
      this.initial = false;
      current = undefined!;
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

// expose global state
let current: HookContext | undefined;

export const hooks = {
  get useState() {
    tinyassert(current);
    return current.useState;
  },
};
