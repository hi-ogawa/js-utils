export function range(n: number): number[] {
  return Array.from(Array(n), (_, i) => i);
}

export function sortBy<T>(ls: T[], ...keyFns: ((x: T) => any)[]): T[] {
  return sortByMap(ls, (x) => keyFns.map((f) => f(x)), arrayCompareFn);
}

function sortByMap<T, V>(
  ls: T[],
  mapFn: (x: T) => V,
  compareFn: (x: V, y: V) => number
): T[] {
  const mapped = ls.map(mapFn);

  function indexCompareFn(i: number, j: number): number {
    return compareFn(mapped[i]!, mapped[j]!);
  }

  return range(ls.length)
    .sort(indexCompareFn)
    .map((i) => ls[i]!);
}

function anyCompareFn(x: any, y: any): number {
  return x < y ? -1 : x > y ? 1 : 0;
}

function arrayCompareFn(xs: any[], ys: any[]): number {
  for (let i = 0; i < xs.length; i++) {
    const result = anyCompareFn(xs[i], ys[i]);
    if (result !== 0) {
      return result;
    }
  }
  return 0;
}
