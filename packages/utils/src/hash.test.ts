import { describe, expect, it } from "vitest";
import { HashRng, hashInt32, hashString } from "./hash";
import { groupBy, mapValues, range } from "./lodash";

function formatBin(x: number) {
  return range(32)
    .map((i) => (x >> i) & 1)
    .join("");
}

describe(hashInt32.name, () => {
  it("basic", () => {
    expect(range(20).map(hashInt32).map(formatBin)).toMatchInlineSnapshot(
      `
      [
        "00000000000000000000000000000000",
        "11001110010111111100101101100000",
        "11100111001011111110010110110000",
        "01011111011110111111011010110000",
        "11001101100010111101010101110111",
        "00110100001000100110000101100010",
        "10101111101111011111101101011000",
        "11111111100011111000111011010101",
        "01000001101110001110010001000001",
        "11101010000001000010001101000000",
        "01001111000100110010100111011101",
        "10101110111000101000101000000100",
        "01101101101001010000100101011011",
        "01100010101001011110011100100010",
        "01011010100111010100110111011111",
        "00010001100001010011000111101000",
        "11111110011100111110010111101011",
        "00101110100100001010001101000111",
        "01110101000000100001000110100000",
        "10000101101110101000010011001110",
      ]
    `
    );
  });
});

describe(HashRng.name, () => {
  it("basic", () => {
    const rng = new HashRng(18181);
    expect(range(10).map(() => formatBin(rng.int32()))).toMatchInlineSnapshot(
      `
      [
        "11101010111001001001100000010010",
        "01010110001111101100000101011101",
        "01001010001110001010001111011111",
        "11010001010100001101101011110010",
        "10011101110011111100110111110001",
        "00111110000001010110011001000110",
        "01001001111011101000010011100001",
        "10010000101000010111001010101001",
        "10010101001000110100111000111110",
        "10001101111000100010101010001100",
      ]
    `
    );
    expect(range(10).map(() => rng.float())).toMatchInlineSnapshot(`
      [
        0.11399699607864022,
        0.1153560969978571,
        0.48829956422559917,
        0.19078235351480544,
        0.025438354816287756,
        0.11207255278714001,
        0.40512499026954174,
        0.7956218882463872,
        0.22402973240241408,
        0.4527048363815993,
      ]
    `);
  });

  it("bins", () => {
    const rng = new HashRng(18181);
    const bins = mapValues(
      groupBy(
        range(1000).map(() => rng.float()),
        (v) => Math.floor(v * 10)
      ),
      (vs) => vs.length
    );
    const sorted = new Map([...bins.entries()].sort());
    expect(sorted).toMatchInlineSnapshot(`
      Map {
        0 => 96,
        1 => 114,
        2 => 111,
        3 => 106,
        4 => 105,
        5 => 110,
        6 => 99,
        7 => 88,
        8 => 72,
        9 => 99,
      }
    `);
  });
});

describe(hashString.name, () => {
  it("basic", () => {
    expect(hashString("hello").length).toMatchInlineSnapshot("32");
    expect(hashString("hello")).toMatchInlineSnapshot(
      '"462fb14350ba33a98b3f4c9deb027e58"'
    );
    expect(range(10).map(String).map(hashString)).toMatchInlineSnapshot(`
      [
        "8ef8ffb785943b292e2f971ce26c1e52",
        "00afd0df2bea949d65dd8b6d3d3218d2",
        "8d0a631566cd81eaea114a04e7141510",
        "0cd3f4168410c08ef4290adc2bd5f692",
        "49f55c78cd61fc64bcc4d71f3ee7a7df",
        "3e7b6f2806dbe6d82dde8a1b81b912ff",
        "152c9a3f90af38ada29222a0ad2bd42b",
        "551fd72cd6162d1e681bb5e246f107ec",
        "1600836ef14883c00017467a2b1fb3eb",
        "d9c289ac21e3bc6e2d0b5368990bc733",
      ]
    `);
  });
});
