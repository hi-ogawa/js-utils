import { range } from "./lodash";

export function solveEditDistance<T>(
  xs: T[],
  ys: T[],
  costFn: (x: T | undefined, y: T | undefined) => number = defaultCostFn
) {
  const n = xs.length;
  const m = ys.length;
  const dp = range(n + 1).map(() => range(m + 1).fill(0));

  for (const i of range(n)) {
    dp[i + 1][0] = dp[i][0] + costFn(xs[i], undefined);
  }

  for (const j of range(m)) {
    dp[0][j + 1] = dp[0][j] + costFn(undefined, ys[j]);
  }

  for (const i of range(n)) {
    for (const j of range(m)) {
      const replace = dp[i][j] + costFn(xs[i], ys[i]);
      const insert = dp[i + 1][j] + costFn(undefined, ys[i]);
      const remove = dp[i][j + 1] + costFn(xs[i], undefined);
      const next = Math.min(replace, insert, remove);
      // TODO: backtrack
      // const op: 0 | 1 | 2 = next === replace ? 0 : next === insert ? 1 : 2;
      dp[i + 1][j + 1] = next;
    }
  }

  return dp[n][m];
}

function defaultCostFn(x: unknown, y: unknown) {
  return x === y ? 0 : 1;
}
