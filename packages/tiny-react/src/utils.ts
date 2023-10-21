export function isEqualShallow(xs: unknown[], ys: unknown[]) {
  return xs.length === ys.length && xs.every((x, i) => x === ys[i]);
}
