import { describe, expect, it } from "vitest";
import { flattenErrorCauses, formatError } from "./error";

describe(formatError, () => {
  it("basic", () => {
    const e1 = new Error("e1", { cause: "just-string" });
    const e2 = new Error("e2", { cause: e1 });

    expect(formatError(e2)).toMatchInlineSnapshot(`
      "
      [41m ERROR [49m e2

      [36m    at /home/hiroshi/code/personal/js-utils/packages/utils/src/error.test.ts:7:16
          at file:///home/hiroshi/code/personal/js-utils/node_modules/.pnpm/@vitest+runner@0.32.2/node_modules/@vitest/runner/dist/index.js:138:13
          at file:///home/hiroshi/code/personal/js-utils/node_modules/.pnpm/@vitest+runner@0.32.2/node_modules/@vitest/runner/dist/index.js:41:26
          at runTest (file:///home/hiroshi/code/personal/js-utils/node_modules/.pnpm/@vitest+runner@0.32.2/node_modules/@vitest/runner/dist/index.js:486:17)
          at runSuite (file:///home/hiroshi/code/personal/js-utils/node_modules/.pnpm/@vitest+runner@0.32.2/node_modules/@vitest/runner/dist/index.js:594:15)
          at runSuite (file:///home/hiroshi/code/personal/js-utils/node_modules/.pnpm/@vitest+runner@0.32.2/node_modules/@vitest/runner/dist/index.js:594:15)
          at runFiles (file:///home/hiroshi/code/personal/js-utils/node_modules/.pnpm/@vitest+runner@0.32.2/node_modules/@vitest/runner/dist/index.js:645:5)
          at startTests (file:///home/hiroshi/code/personal/js-utils/node_modules/.pnpm/@vitest+runner@0.32.2/node_modules/@vitest/runner/dist/index.js:654:3)
          at file:///home/hiroshi/code/personal/js-utils/node_modules/.pnpm/vitest@0.32.2/node_modules/vitest/dist/entry.js:278:7
          at withEnv (file:///home/hiroshi/code/personal/js-utils/node_modules/.pnpm/vitest@0.32.2/node_modules/vitest/dist/entry.js:186:5)[39m


      [41m ERROR:CAUSE [49m e1

      [36m    at /home/hiroshi/code/personal/js-utils/packages/utils/src/error.test.ts:6:16
          at file:///home/hiroshi/code/personal/js-utils/node_modules/.pnpm/@vitest+runner@0.32.2/node_modules/@vitest/runner/dist/index.js:138:13
          at file:///home/hiroshi/code/personal/js-utils/node_modules/.pnpm/@vitest+runner@0.32.2/node_modules/@vitest/runner/dist/index.js:41:26
          at runTest (file:///home/hiroshi/code/personal/js-utils/node_modules/.pnpm/@vitest+runner@0.32.2/node_modules/@vitest/runner/dist/index.js:486:17)
          at runSuite (file:///home/hiroshi/code/personal/js-utils/node_modules/.pnpm/@vitest+runner@0.32.2/node_modules/@vitest/runner/dist/index.js:594:15)
          at runSuite (file:///home/hiroshi/code/personal/js-utils/node_modules/.pnpm/@vitest+runner@0.32.2/node_modules/@vitest/runner/dist/index.js:594:15)
          at runFiles (file:///home/hiroshi/code/personal/js-utils/node_modules/.pnpm/@vitest+runner@0.32.2/node_modules/@vitest/runner/dist/index.js:645:5)
          at startTests (file:///home/hiroshi/code/personal/js-utils/node_modules/.pnpm/@vitest+runner@0.32.2/node_modules/@vitest/runner/dist/index.js:654:3)
          at file:///home/hiroshi/code/personal/js-utils/node_modules/.pnpm/vitest@0.32.2/node_modules/vitest/dist/entry.js:278:7
          at withEnv (file:///home/hiroshi/code/personal/js-utils/node_modules/.pnpm/vitest@0.32.2/node_modules/vitest/dist/entry.js:186:5)[39m


      [41m ERROR:CAUSE:2 [49m just-string

      "
    `);

    expect(formatError(e2, { noCause: true })).toMatchInlineSnapshot(`
      "
      [41m ERROR [49m e2

      [36m    at /home/hiroshi/code/personal/js-utils/packages/utils/src/error.test.ts:7:16
          at file:///home/hiroshi/code/personal/js-utils/node_modules/.pnpm/@vitest+runner@0.32.2/node_modules/@vitest/runner/dist/index.js:138:13
          at file:///home/hiroshi/code/personal/js-utils/node_modules/.pnpm/@vitest+runner@0.32.2/node_modules/@vitest/runner/dist/index.js:41:26
          at runTest (file:///home/hiroshi/code/personal/js-utils/node_modules/.pnpm/@vitest+runner@0.32.2/node_modules/@vitest/runner/dist/index.js:486:17)
          at runSuite (file:///home/hiroshi/code/personal/js-utils/node_modules/.pnpm/@vitest+runner@0.32.2/node_modules/@vitest/runner/dist/index.js:594:15)
          at runSuite (file:///home/hiroshi/code/personal/js-utils/node_modules/.pnpm/@vitest+runner@0.32.2/node_modules/@vitest/runner/dist/index.js:594:15)
          at runFiles (file:///home/hiroshi/code/personal/js-utils/node_modules/.pnpm/@vitest+runner@0.32.2/node_modules/@vitest/runner/dist/index.js:645:5)
          at startTests (file:///home/hiroshi/code/personal/js-utils/node_modules/.pnpm/@vitest+runner@0.32.2/node_modules/@vitest/runner/dist/index.js:654:3)
          at file:///home/hiroshi/code/personal/js-utils/node_modules/.pnpm/vitest@0.32.2/node_modules/vitest/dist/entry.js:278:7
          at withEnv (file:///home/hiroshi/code/personal/js-utils/node_modules/.pnpm/vitest@0.32.2/node_modules/vitest/dist/entry.js:186:5)[39m
      "
    `);

    expect(formatError(e2, { noColor: true })).toMatchInlineSnapshot(`
      "
      [ERROR] e2

          at /home/hiroshi/code/personal/js-utils/packages/utils/src/error.test.ts:7:16
          at file:///home/hiroshi/code/personal/js-utils/node_modules/.pnpm/@vitest+runner@0.32.2/node_modules/@vitest/runner/dist/index.js:138:13
          at file:///home/hiroshi/code/personal/js-utils/node_modules/.pnpm/@vitest+runner@0.32.2/node_modules/@vitest/runner/dist/index.js:41:26
          at runTest (file:///home/hiroshi/code/personal/js-utils/node_modules/.pnpm/@vitest+runner@0.32.2/node_modules/@vitest/runner/dist/index.js:486:17)
          at runSuite (file:///home/hiroshi/code/personal/js-utils/node_modules/.pnpm/@vitest+runner@0.32.2/node_modules/@vitest/runner/dist/index.js:594:15)
          at runSuite (file:///home/hiroshi/code/personal/js-utils/node_modules/.pnpm/@vitest+runner@0.32.2/node_modules/@vitest/runner/dist/index.js:594:15)
          at runFiles (file:///home/hiroshi/code/personal/js-utils/node_modules/.pnpm/@vitest+runner@0.32.2/node_modules/@vitest/runner/dist/index.js:645:5)
          at startTests (file:///home/hiroshi/code/personal/js-utils/node_modules/.pnpm/@vitest+runner@0.32.2/node_modules/@vitest/runner/dist/index.js:654:3)
          at file:///home/hiroshi/code/personal/js-utils/node_modules/.pnpm/vitest@0.32.2/node_modules/vitest/dist/entry.js:278:7
          at withEnv (file:///home/hiroshi/code/personal/js-utils/node_modules/.pnpm/vitest@0.32.2/node_modules/vitest/dist/entry.js:186:5)


      [ERROR:CAUSE] e1

          at /home/hiroshi/code/personal/js-utils/packages/utils/src/error.test.ts:6:16
          at file:///home/hiroshi/code/personal/js-utils/node_modules/.pnpm/@vitest+runner@0.32.2/node_modules/@vitest/runner/dist/index.js:138:13
          at file:///home/hiroshi/code/personal/js-utils/node_modules/.pnpm/@vitest+runner@0.32.2/node_modules/@vitest/runner/dist/index.js:41:26
          at runTest (file:///home/hiroshi/code/personal/js-utils/node_modules/.pnpm/@vitest+runner@0.32.2/node_modules/@vitest/runner/dist/index.js:486:17)
          at runSuite (file:///home/hiroshi/code/personal/js-utils/node_modules/.pnpm/@vitest+runner@0.32.2/node_modules/@vitest/runner/dist/index.js:594:15)
          at runSuite (file:///home/hiroshi/code/personal/js-utils/node_modules/.pnpm/@vitest+runner@0.32.2/node_modules/@vitest/runner/dist/index.js:594:15)
          at runFiles (file:///home/hiroshi/code/personal/js-utils/node_modules/.pnpm/@vitest+runner@0.32.2/node_modules/@vitest/runner/dist/index.js:645:5)
          at startTests (file:///home/hiroshi/code/personal/js-utils/node_modules/.pnpm/@vitest+runner@0.32.2/node_modules/@vitest/runner/dist/index.js:654:3)
          at file:///home/hiroshi/code/personal/js-utils/node_modules/.pnpm/vitest@0.32.2/node_modules/vitest/dist/entry.js:278:7
          at withEnv (file:///home/hiroshi/code/personal/js-utils/node_modules/.pnpm/vitest@0.32.2/node_modules/vitest/dist/entry.js:186:5)


      [ERROR:CAUSE:2] just-string

      "
    `);
  });
});

describe(flattenErrorCauses, () => {
  it("handle cyclic reference", () => {
    const e1 = new Error("e1");
    const e2 = new Error("e2", { cause: e1 });
    e1.cause = e2;
    expect(flattenErrorCauses(e1)).toMatchInlineSnapshot(`
      [
        [Error: e1],
        [Error: e2],
      ]
    `);
  });
});
