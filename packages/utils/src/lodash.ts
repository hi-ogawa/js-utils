export function range(n: number): number[] {
  return Array.from(Array(n), (_, i) => i);
}

export function sortBy<T>(ls: T[], ...keyFns: ((x: T) => any)[]): T[] {
  return sortByMap(ls, (x) => keyFns.map((f) => f(x)), arrayCompareFn);
}

export function groupBy<T, K>(ls: T[], f: (x: T) => K): Map<K, T[]> {
  const result = new Map<K, T[]>();
  for (const x of ls) {
    const y = f(x);
    if (!result.has(y)) {
      result.set(y, []);
    }
    result.get(y)!.push(x);
  }
  return result;
}

export function uniq<T>(ls: T[]): T[] {
  return Array.from(new Set(ls));
}

export function uniqBy<T>(ls: T[], f: (x: T) => unknown): T[] {
  const ys = new Set<unknown>();
  return ls.filter((x) => {
    const y = f(x);
    if (ys.has(y)) {
      return false;
    }
    ys.add(y);
    return true;
  });
}

export function partition<T>(ls: T[], f: (x: T) => boolean): [T[], T[]] {
  const result: [T[], T[]] = [[], []];
  for (const x of ls) {
    result[f(x) ? 0 : 1].push(x);
  }
  return result;
}

//
// internal
//

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
