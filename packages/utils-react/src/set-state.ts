import React from "react";

//
// setState enhancement
//

export function toDelayedSetState<T>(
  setState: React.Dispatch<React.SetStateAction<T>>
) {
  const [subscribe, setSubscribe] = React.useState<() => () => void>();

  function setStateDelayed(value: React.SetStateAction<T>, ms: number) {
    setSubscribe(() => () => {
      const unsubscribe = setTimeout(() => {
        setState(value);
        setSubscribe(undefined);
      }, ms);
      return () => {
        clearTimeout(unsubscribe);
      };
    });
  }

  function reset() {
    setSubscribe(undefined);
  }

  const pending = Boolean(subscribe);

  React.useEffect(() => subscribe?.(), [subscribe]);

  return [
    React.useCallback(setStateDelayed, [setState]),
    React.useCallback(reset, []),
    pending,
  ] as const;
}

//
// setState wrapper for mutable methods
//

export function toImmutableSetState<T, Method extends (...args: any[]) => void>(
  setState: React.Dispatch<React.SetStateAction<T>>,
  mutableMethod: Method,
  shallowCopy: (value: T) => T
): OmitThisParameter<Method> {
  const wrapper = (...args: Parameters<Method>) => {
    setState((prev) => {
      prev = shallowCopy(prev);
      mutableMethod.bind(prev)(...args);
      return prev;
    });
  };
  return wrapper as any;
}

// cf. https://github.com/streamich/react-use/blob/master/docs/useList.md
export function toArraySetState<T>(
  setState: React.Dispatch<React.SetStateAction<T[]>>
) {
  // alias prototype for typing
  const pt = Array.prototype as T[];
  const copy = (ls: T[]) => [...ls];

  return {
    push: toImmutableSetState(setState, pt.push, copy),
    sort: toImmutableSetState(setState, pt.sort, copy),
    splice: toImmutableSetState(setState, pt.splice, copy),
    toggle: toImmutableSetState(
      setState,
      toggleArray as typeof toggleArray<T>,
      copy
    ),
    set: toImmutableSetState(
      setState,
      function set(
        this: T[],
        i: number,
        next: T | ((prev: T | undefined) => T)
      ) {
        const prev = this[i];
        // need "any" since T might be a function itself
        this[i] = typeof next === "function" ? (next as any)(prev) : next;
      },
      copy
    ),
  };
}

export function toSetSetState<T>(
  setState: React.Dispatch<React.SetStateAction<Set<T>>>
) {
  // alias prototype for typing
  const pt = Set.prototype as Set<T>;
  const copy = (ls: Set<T>) => new Set(ls);

  return {
    add: toImmutableSetState(setState, pt.add, copy),
    delete: toImmutableSetState(setState, pt.delete, copy),
    clear: toImmutableSetState(setState, pt.clear, copy),
    toggle: toImmutableSetState(
      setState,
      toggleSet as typeof toggleSet<T>,
      copy
    ),
  };
}

// TODO: to utils?
function toggleArray<T>(this: T[], value: T): void {
  const index = this.indexOf(value);
  if (index < 0) {
    this.push(value);
  } else {
    this.splice(index, 1);
  }
}

function toggleSet<T>(this: Set<T>, value: T): void {
  if (this.has(value)) {
    this.delete(value);
  } else {
    this.add(value);
  }
}
