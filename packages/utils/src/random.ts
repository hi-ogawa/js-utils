import { range } from "./lodash";

type Rng = {
  float: () => number;
};

export function shuffle<T>(ls: T[], rng: Rng): T[] {
  const result: T[] = [];
  ls = [...ls];
  while (ls.length > 0) {
    const i = Math.floor(rng.float() * ls.length);
    result.push(...ls.splice(i, 1));
  }
  return result;
}

export function randomSplit<T>(ls: T[], size: number, rng: Rng): T[][] {
  const ks = range(size).map(() => rng.float());
  const sum = ks.reduce((x, y) => x + y);
  const result: T[][] = [];
  let acc = 0;
  for (const k of ks) {
    const accNext = acc + (k / sum) * ls.length;
    result.push(ls.slice(Math.floor(acc), Math.floor(accNext)));
    acc = accNext;
  }
  return result;
}

export function randomSplitRecursive(
  ls: number[],
  depth: number,
  splitSize: number,
  rng: Rng
): unknown[] {
  if (depth === 0) {
    return ls;
  }
  return randomSplit(ls, splitSize, rng).map((ls) =>
    randomSplitRecursive(ls, depth - 1, splitSize, rng)
  );
}
