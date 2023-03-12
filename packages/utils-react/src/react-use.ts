// react-use like utility

// cf. https://github.com/streamich/react-use/blob/master/docs/useList.md
function toArraySetState<T>(
  setState: React.Dispatch<React.SetStateAction<T[]>>
) {
  function wrapMutable(f: (value: T[]) => void): (prev: T[]) => T[] {
    return (prev) => {
      prev = [...prev];
      f(prev);
      return prev;
    };
  }

  // TODO: can auto-generate everything from prototype signature based on mutability?

  //
  // mutable
  //
  const push = (...args: Parameters<typeof Array.prototype.push>) => {
    setState(wrapMutable((ls) => ls.push(...args)));
  };

  //
  // immutable
  //
  const filter = (...args: Parameters<typeof Array.prototype.filter>) => {
    setState((ls) => ls.filter(...args));
  };

  return { push, filter };
}
