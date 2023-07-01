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
