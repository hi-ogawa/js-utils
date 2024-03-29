import { describe, expect, it } from "vitest";
import { HashRng, hashInt32, hashString } from "./hash";
import { mapGroupBy, range } from "./lodash";

function formatBin(x: number) {
  return range(32)
    .map((i) => (x >> i) & 1)
    .join("");
}

describe(hashInt32, () => {
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

describe(HashRng, () => {
  it("basic", () => {
    const rng = new HashRng();
    expect(range(10).map(() => formatBin(rng.int32()))).toMatchInlineSnapshot(
      `
      [
        "00001100001001011001100001111001",
        "01111011000000001001110101011001",
        "00100110110110101101001100110001",
        "11010001100010000001100001100110",
        "10011110001011000010101001110000",
        "01111000000111111010100111011100",
        "11111011010000101011000011010101",
        "11101110010010010010011110001000",
        "11000101011111110000010100010100",
        "01110101100001011011001001100011",
      ]
    `
    );
    expect(range(10).map(() => rng.float())).toMatchInlineSnapshot(`
      [
        0.1529179501812905,
        0.5866188027430326,
        0.32817029813304543,
        0.8077164916321635,
        0.9605578861664981,
        0.41179444873705506,
        0.8045517979189754,
        0.24116202630102634,
        0.03922410309314728,
        0.07753831683658063,
      ]
    `);
  });

  it("bins", () => {
    const rng = new HashRng();
    const bins = mapGroupBy(
      range(1000).map(() => rng.float()),
      (v) => Math.floor(v * 10),
      (vs) => vs.length
    );
    const sorted = new Map([...bins.entries()].sort());
    expect(sorted).toMatchInlineSnapshot(`
      Map {
        0 => 96,
        1 => 106,
        2 => 105,
        3 => 118,
        4 => 104,
        5 => 83,
        6 => 112,
        7 => 87,
        8 => 99,
        9 => 90,
      }
    `);
  });
});

describe(hashString, () => {
  it("basic", () => {
    expect(hashString("hello").length).toMatchInlineSnapshot("32");
    expect(hashString("hello")).toMatchInlineSnapshot(
      '"33404c8ffab857730077534ecea96ab0"'
    );
    expect(
      range(10)
        .map(String)
        .map((v) => hashString(v))
    ).toMatchInlineSnapshot(`
      [
        "c058ceb51a9b50de5960d20780e4ecf8",
        "dc4abac120fe5e63a71df9d505b34753",
        "8c5463bf3c01b227582146da5fc69262",
        "a596b8d4a1d0810be3ee11985d7c70aa",
        "dd220a216d7a801a825e9c59923ffbc7",
        "0fd1804ed2230f3e178d8f2597bb9d3f",
        "7c6d4246e4298f9c4176be6c7dbfae9a",
        "59e3a7158030f8ee98131bafcaccd20e",
        "e0b69a46d203e20ffbf2b5976f2fbd15",
        "7b789ab4823a80b1fab16634a49a890d",
      ]
    `);
  });
});
