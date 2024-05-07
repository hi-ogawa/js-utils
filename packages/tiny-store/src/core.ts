//
// platform agnostic store api
//

export interface TinyStoreApi<T, RO extends boolean = false> {
  get: () => T;
  set: RO extends true ? null : (newValue: SetAction<T>) => void; // hide method when RO (readonly)
  subscribe: (onStoreChange: () => void) => () => void;
}

//
// transform
//

// transform read/write (e.g. for JSON.parse/stringify based local storage)
export function tinyStoreTransform<T1, T2>(
  store: TinyStoreApi<T1>,
  decode: (v1: T1) => T2,
  encode: (v2: T2) => T1,
): TinyStoreApi<T2> {
  const decodeMemo = memoizeOne(decode);
  return {
    get: () => decodeMemo(store.get()),
    set: (v2) => {
      // TODO: invalidate cache so that next `get` will see fresh data?
      store.set((v1) => encode(applyAction(() => decodeMemo(v1), v2)));
    },
    subscribe: store.subscribe,
  };
}

// transform readonly (for memoized selection)
export function tinyStoreSelect<T1, T2>(
  store: Omit<TinyStoreApi<T1>, "set">,
  decode: (v: T1) => T2,
): TinyStoreApi<T2, true> {
  // `subscribe` based on original store, but as long as `get` returns memoized value,
  // `useSyncExternalStore` won't cause re-rendering
  const decodeMemo = memoizeOne(decode);
  return {
    get: () => decodeMemo(store.get()),
    set: null,
    subscribe: store.subscribe,
  };
}

// make result stable if the input is same as last (i.e. memoize with cache size 1)
function memoizeOne<F extends (arg: any) => any>(f: F): F {
  let last: { k: any; v: any } | undefined;
  return function wrapper(arg: any) {
    if (!last || last.k !== arg) {
      last = { k: arg, v: f(arg) };
    }
    return last.v;
  } as any;
}

//
// base store implementation
//

export function createTinyStore<T>(defaultValue: T): TinyStoreApi<T> {
  return new TinyStore(new TinyStoreMemoryAdapter<T>(defaultValue));
}

export class TinyStore<T> implements TinyStoreApi<T> {
  private listeners = new Set<() => void>();

  constructor(private adapter: TinyStoreAdapter<T>) {}

  get = () => this.adapter.get();

  set = (action: SetAction<T>) => {
    this.adapter.set(applyAction(this.get, action));
    this.notify();
  };

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    const unsubscribeAdapter = this.adapter.subscribe?.(listener);
    return () => {
      unsubscribeAdapter?.();
      this.listeners.delete(listener);
    };
  };

  protected notify = () => {
    this.listeners.forEach((l) => l());
  };
}

type SetAction<T> = T | ((prev: T) => T);

function applyAction<T>(v: () => T, action: SetAction<T>): T {
  // it cannot narrow enough since `T` itself could be a function
  return typeof action === "function" ? (action as any)(v()) : action;
}

//
// abstract adapter to naturally support LocalStorage
//

export interface TinyStoreAdapter<T> {
  get: () => T;
  set: (value: T) => void;
  subscribe?: (onStoreChange: () => void) => () => void;
}

class TinyStoreMemoryAdapter<T> implements TinyStoreAdapter<T> {
  constructor(private value: T) {}
  get = () => this.value;
  set = (value: T) => (this.value = value);
}
