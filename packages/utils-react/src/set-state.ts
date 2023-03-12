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
      }, ms);
      return () => {
        clearTimeout(unsubscribe);
      };
    });
  }

  function reset() {
    setSubscribe(undefined);
  }

  React.useEffect(() => subscribe?.(), [subscribe]);

  return [
    React.useCallback(setStateDelayed, [setState]),
    React.useCallback(reset, []),
  ] as const;
}

//
// setState wrapper for mutable methods
//

export function toImmutableSetState<T, Method extends (...args: any[]) => void>(
  setState: React.Dispatch<React.SetStateAction<T>>,
  mutableMethod: Method,
  shallowCopy: (value: T) => T
): Method {
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
  const prototype = Array.prototype as T[];
  const shallowCopy = (ls: T[]) => [...ls];

  return {
    push: toImmutableSetState(setState, prototype.push, shallowCopy),
    sort: toImmutableSetState(setState, prototype.sort, shallowCopy),
    splice: toImmutableSetState(setState, prototype.splice, shallowCopy),
  };
}

export function toSetSetState<T>(
  setState: React.Dispatch<React.SetStateAction<Set<T>>>
) {
  // alias prototype for typing
  const prototype = Set.prototype as Set<T>;
  const shallowCopy = (ls: Set<T>) => new Set(ls);

  return {
    add: toImmutableSetState(setState, prototype.add, shallowCopy),
    delete: toImmutableSetState(setState, prototype.delete, shallowCopy),
    clear: toImmutableSetState(setState, prototype.clear, shallowCopy),
  };
}
