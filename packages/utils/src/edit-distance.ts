import { range } from "./lodash";

const ops = {
  none: -1,
  replace: 0,
  insert: 1,
  remove: 2,
} as const;

export function solveEditDistance<T>(
  xs: T[],
  ys: T[],
  costFn: (x: T | undefined, y: T | undefined) => number = defaultCostFn
) {
  const n = xs.length;
  const m = ys.length;
  const dp = range(n + 1).map(() => range(m + 1).map(() => [0, ops.none]));

  for (const i of range(n)) {
    dp[i + 1][0][0] = dp[i][0][0] + costFn(xs[i], undefined);
    dp[i + 1][0][1] = ops.remove;
  }

  for (const j of range(m)) {
    dp[0][j + 1][0] = dp[0][j][0] + costFn(undefined, ys[j]);
    dp[0][j + 1][1] = ops.insert;
  }

  for (const i of range(n)) {
    for (const j of range(m)) {
      const replace = dp[i][j][0] + costFn(xs[i], ys[i]);
      const insert = dp[i + 1][j][0] + costFn(undefined, ys[i]);
      const remove = dp[i][j + 1][0] + costFn(xs[i], undefined);
      const next = Math.min(replace, insert, remove);
      dp[i + 1][j + 1][0] = next;
      dp[i + 1][j + 1][1] =
        next === replace
          ? ops.replace
          : next === insert
          ? ops.insert
          : ops.remove;
    }
  }

  console.log(dp);

  const cost = dp[n][m][0];

  // backtrack
  const path: any[] = [];
  let i = n;
  let j = m;
  while (i > 0 || j > 0) {
    const [cost, op] = dp[i][j];
    path.push({ i, j, cost, op });
    if (op === ops.replace) {
      i--;
      j--;
    } else if (op === ops.insert) {
      j--;
    } else if (op === ops.remove) {
      i--;
    }
  }

  return { cost, path };
}

function defaultCostFn(x: unknown, y: unknown) {
  return x === y ? 0 : 1;
}
