import { murmur3_32 } from "@hiogawa/utils";
import fc from "fast-check";
import { beforeAll, describe, expect, it } from "vitest";
import * as bundle from "../dist/bundle";

beforeAll(async () => {
  await bundle.init();
});

describe("fuzz", () => {
  it("murmur3_32", () => {
    fc.assert(
      fc.property(
        fc.uint8Array(),
        fc.integer({ min: 0, max: 2 ** 32 - 1 }),
        (input, seed) => {
          const l = bundle.murmur3_32(input, seed);
          const r = murmur3_32(input, seed);
          expect(l).toBe(r);
        }
      ),
      { verbose: true, numRuns: 10 ** 4 }
    );
  });
});
