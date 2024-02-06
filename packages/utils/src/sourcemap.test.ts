import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  type DecodedMappings,
  decodeMappings,
  encodeMappings,
  formatBin,
} from "./sourcemap";

describe(decodeMappings, () => {
  function formatDecoded(decoded: DecodedMappings) {
    return decoded
      .map(
        (segments) =>
          "\n" + segments.map((segments) => segments.join(",")).join("|")
      )
      .join();
  }

  it("basic", () => {
    expect(decodeMappings("")).toMatchInlineSnapshot(`[]`);
    expect(decodeMappings(";")).toMatchInlineSnapshot(`
      [
        [],
      ]
    `);
    expect(decodeMappings(";;")).toMatchInlineSnapshot(`
      [
        [],
        [],
      ]
    `);
    expect(formatDecoded(decodeMappings("A,AAAB;;ABCDE;")))
      .toMatchInlineSnapshot(`
        "
        0|0,0,0,-2147483648,
        ,
        0,-2147483648,1,-2147483649,2"
      `);
    expect(
      formatDecoded(
        decodeMappings(
          "AAAA,uCAAC,UAAY,KAAK,MAAQ,cAAc,KAAO,OAAO,MAAQ,MAAM,KAAO,MAAK;ACAhF,SAAS,OAAO;AACd,iCAAgB;AAChB,UAAQ,IAAI,OAAO;AACrB;AACA,KAAK;"
        )
      )
    ).toMatchInlineSnapshot(`
      "
      0,0,0,0|39,0,0,1|49,0,0,13|54,0,0,18|60,0,0,26|74,0,0,40|79,0,0,47|86,0,0,54|92,0,0,62|98,0,0,68|103,0,0,75|109,0,0,80,
      0,1,0,0|9,1,0,9|16,1,0,16,
      0,1,1,2|33,1,1,18,
      0,1,2,2|10,1,2,10|14,1,2,14|21,1,2,21,
      0,1,3,0,
      0,1,4,0|5,1,4,5"
    `);
  });
});

describe(encodeMappings, () => {
  it("basic", () => {
    const mappings =
      "AAAA,uCAAC,UAAY,KAAK,MAAQ,cAAc,KAAO,OAAO,MAAQ,MAAM,KAAO,MAAK;ACAhF,SAAS,OAAO;AACd,iCAAgB;AAChB,UAAQ,IAAI,OAAO;AACrB;AACA,KAAK;";
    expect(encodeMappings(decodeMappings(mappings))).toEqual(mappings);
  });

  it("edge cases", () => {
    expect(encodeMappings([])).toMatchInlineSnapshot(`""`);
    expect(encodeMappings([[]])).toMatchInlineSnapshot(`";"`);
    expect(encodeMappings([[], []])).toMatchInlineSnapshot(`";;"`);
    expect(decodeMappings("")).toMatchInlineSnapshot(`[]`);
    expect(decodeMappings(";")).toMatchInlineSnapshot(`
      [
        [],
      ]
    `);
    expect(encodeMappings([[[1 << 30]]])).toMatchInlineSnapshot(`"ggggggC;"`);
    expect(decodeMappings("ggggggC")).toEqual([[[1 << 30]]]);

    // doesn't round trip since encoding ensures ";"
    expect(encodeMappings(decodeMappings("AAAA"))).toMatchInlineSnapshot(
      `"AAAA;"`
    );
  });
});

describe("fuzz", () => {
  it("decodeMappings(encodeMappings(...))", () => {
    const fcSegment = fc.array(fc.integer({ min: 0, max: 1 << 30 }), {
      minLength: 4,
      maxLength: 4,
    }) as fc.Arbitrary<[number, number, number, number]>;

    const fcMappings = fc.array(fc.array(fcSegment));

    fc.assert(
      fc.property(fcMappings, (mappings) => {
        expect(decodeMappings(encodeMappings(mappings))).toEqual(mappings);
      })
    );
  });
});

describe(formatBin, () => {
  it("basic", () => {
    expect(formatBin(1 << 31)).toMatchInlineSnapshot(
      `"10000000_00000000_00000000_00000000"`
    );
    expect(formatBin(-1)).toMatchInlineSnapshot(
      `"11111111_11111111_11111111_11111111"`
    );
  });
});
