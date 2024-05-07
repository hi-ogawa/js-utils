import { range } from "./lodash";

export const EDIT_OP = {
  none: -1,
  replace: 0,
  insert: 1,
  remove: 2,
};

function defaultCostFn(x: unknown, y: unknown) {
  return x === y ? 0 : 1;
}

export function solveEditDistance<T>(
  xs: T[],
  ys: T[],
  costFn: (x: T | undefined, y: T | undefined) => number = defaultCostFn,
) {
  const n = xs.length;
  const m = ys.length;

  // dp[i][j] = [(total cost), (last op), (last delta)]
  const dp = range(n + 1).map(() =>
    range(m + 1).map(() => [0, EDIT_OP.none, -1]),
  );

  for (const i of range(n)) {
    const delta = costFn(xs[i], undefined);
    dp[i + 1][0][0] = dp[i][0][0] + delta;
    dp[i + 1][0][1] = EDIT_OP.remove;
    dp[i + 1][0][2] = delta;
  }

  for (const j of range(m)) {
    const delta = costFn(undefined, ys[j]);
    dp[0][j + 1][0] = dp[0][j][0] + delta;
    dp[0][j + 1][1] = EDIT_OP.insert;
    dp[0][j + 1][2] = delta;
  }

  for (const i of range(n)) {
    for (const j of range(m)) {
      const next1 = dp[i][j][0] + costFn(xs[i], ys[j]);
      const next2 = dp[i + 1][j][0] + costFn(undefined, ys[j]);
      const next3 = dp[i][j + 1][0] + costFn(xs[i], undefined);
      const next = Math.min(next1, next2, next3);
      dp[i + 1][j + 1][0] = next;
      if (next === next1) {
        dp[i + 1][j + 1][1] = EDIT_OP.replace;
        dp[i + 1][j + 1][2] = next - dp[i][j][0];
      }
      if (next === next2) {
        dp[i + 1][j + 1][1] = EDIT_OP.insert;
        dp[i + 1][j + 1][2] = next - dp[i + 1][j][0];
      }
      if (next === next3) {
        dp[i + 1][j + 1][1] = EDIT_OP.remove;
        dp[i + 1][j + 1][2] = next - dp[i][j + 1][0];
      }
    }
  }

  const total = dp[n][m][0];

  // backtrack
  type EditStep = {
    i: number;
    j: number;
    op: number;
    delta: number;
    total: number;
  };
  const steps: EditStep[] = [];
  let i = n;
  let j = m;
  while (i > 0 || j > 0) {
    const [total, op, delta] = dp[i][j];
    steps.push({ i, j, total, op, delta });
    if (op === EDIT_OP.replace) {
      i--;
      j--;
    } else if (op === EDIT_OP.insert) {
      j--;
    } else if (op === EDIT_OP.remove) {
      i--;
    }
  }
  steps.reverse();

  return { total, steps };
}
