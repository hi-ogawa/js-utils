import { beforeAll, describe, expect, it } from "vitest";
import { initBundle, murmur3_32 } from "../dist/bundle";

beforeAll(async () => {
  await initBundle();
});

describe("bundle", () => {
  describe("cases", () => {
    // from https://github.com/stusmall/murmur3/blob/07e7a1ab421f8807ff49d3ad1388bda4d43d6544/tests/test.rs
    const cases = [
      [0x00000000, ""],
      [0x9416ac93, "1"],
      [0x721c5dc3, "1234"],
      [0x13a51193, "12345"],
      [0xc0363e43, "Hello, world!"],
    ] as const;

    for (const [output, input] of cases) {
      it(`${input}`, () => {
        const u8 = new TextEncoder().encode(input);
        const seed = 0;
        expect(murmur3_32(u8, seed)).toBe(output);
      });
    }
  });
});
