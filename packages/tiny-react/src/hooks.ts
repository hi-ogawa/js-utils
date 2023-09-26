import { tinyassert } from "@hiogawa/utils";
import { h } from "./core";

//
// abstract hook api logic
//

export class HookContextManager<T, Ctx extends HookContextBase<T>> {
  private contexts = new WeakMap<object, Ctx>();
  private current: Ctx | undefined; // it can be stack to allow recursive run

  constructor(private createContext: () => Ctx) {}

  private setupContext(id: object): Ctx {
    if (!this.contexts.has(id)) {
      this.contexts.set(id, this.createContext());
    }
    return this.contexts.get(id)!;
  }

  run = <U>(id: object, data: T, f: () => U): U => {
    tinyassert(!this.current);
    this.current = this.setupContext(id);
    this.current.before(data);
    try {
      return f();
    } finally {
      this.current.after();
      this.current = undefined;
    }
  };

  defineHook = <F extends (...args: any) => any>(
    implementHook: (context: Ctx) => F
  ): F => {
    return ((...args: any[]) => {
      tinyassert(this.current);
      return implementHook(this.current)(...args);
    }) as F;
  };
}

interface HookContextBase<T> {
  before: (data: T) => void;
  after: () => void;
}

//
// hook implementations
//

type HookState = ReducerHookState | EffectHookState;

type ReducerHookState = {
  type: "reducer";
  state: unknown;
};

type EffectHookState = {
  type: "effect";
};

class HookContext implements HookContextBase<unknown> {
  private hookCount = 0;
  private component: unknown;
  private hooks: HookState[] = [];
  private initial = true;

  // implements HookContextBase
  before = (component: unknown) => {
    this.hookCount = 0;
    this.component = component;
  };

  after = () => {
    this.initial = false;
    this.component = undefined;
  };

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
      HookContext.notify(this);
    };
    return [state, setState] as const;
  };

  //
  // global notification to schedule re-render
  //

  private static listeners = new Set<(component: unknown) => void>();

  static subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private static notify = (ctx: HookContext) => {
    this.listeners.forEach((f) => f(ctx.component));
  };
}

const manager = new HookContextManager(() => new HookContext());

HookContext.subscribe(() => {
  "for example, schedule re-render on setState";
});

const useState = manager.defineHook((ctx) => ctx.useState);

function Counter() {
  const [state, setState] = useState(0);

  return h("span", {
    children: [
      h("span", { children: [state] }),
      h("button", { onClick: () => setState(state + 1) }),
    ],
  });
}

const vnode = h(Counter, {});
manager.run({ someObject: "for weak map key" }, vnode, Counter);
