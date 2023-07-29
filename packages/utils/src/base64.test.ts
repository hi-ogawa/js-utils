import { Buffer } from "node:buffer";
import crypto from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  base64FromBase64url,
  base64ToBase64url,
  fromBase64,
  toBase64,
} from "./base64";
import { range } from "./lodash";

describe("base64", () => {
  it("basic", () => {
    const textEncoder = new TextEncoder();
    const textDecoder = new TextDecoder();

    const data = "hello";
    const dataBin = textEncoder.encode(data);
    expect(dataBin).toMatchInlineSnapshot(`
      Uint8Array [
        104,
        101,
        108,
        108,
        111,
      ]
    `);

    const base64Bin = toBase64(dataBin);
    expect(base64Bin).toMatchInlineSnapshot(`
      Uint8Array [
        97,
        71,
        86,
        115,
        98,
        71,
        56,
        61,
      ]
    `);

    const base64 = textDecoder.decode(base64Bin);
    expect(base64).toMatchInlineSnapshot('"aGVsbG8="');

    const dataBin2 = fromBase64(base64Bin);
    expect(dataBin2).toMatchInlineSnapshot(`
      Uint8Array [
        104,
        101,
        108,
        108,
        111,
      ]
    `);

    const data2 = textDecoder.decode(dataBin2);
    expect(data2).toMatchInlineSnapshot('"hello"');
    expect(data2).toEqual(data);
  });

  it("special cases", () => {
    expect(toBase64(new Uint8Array([]))).toMatchInlineSnapshot("Uint8Array []");
    expect(fromBase64(new Uint8Array([]))).toMatchInlineSnapshot(
      "Uint8Array []"
    );
  });

  it("error", () => {
    expect(() =>
      fromBase64(new Uint8Array([0]))
    ).toThrowErrorMatchingInlineSnapshot('"invalid length"');

    expect(() =>
      fromBase64(new Uint8Array([0, 0, 0, 0]))
    ).toThrowErrorMatchingInlineSnapshot('"invalid data"');
  });

  it("roundtrip-fuzz-small", () => {
    for (const _ of range(10000)) {
      const len = crypto.randomInt(0, 10);
      const input = new Uint8Array(crypto.randomBytes(len));
      const output = toBase64(input);
      const input2 = fromBase64(output);
      expect(input2).toEqual(input);
    }
  });

  it("roundtrip-fuzz-big", () => {
    for (const _ of range(10)) {
      const len = crypto.randomInt(0, 10000);
      const input = new Uint8Array(crypto.randomBytes(len));
      const output = toBase64(input);
      const input2 = fromBase64(output);
      expect(input2).toEqual(input);
    }
  });

  it("reference-fuzz", () => {
    const textDecoder = new TextDecoder();
    for (const _ of range(1000)) {
      const len = crypto.randomInt(0, 1000);
      const input = new Uint8Array(crypto.randomBytes(len));
      const output = toBase64(input);
      expect(textDecoder.decode(output)).toEqual(
        Buffer.from(input).toString("base64")
      );
    }
  });
});

describe("base64url", () => {
  it("basic", () => {
    const textDecoder = new TextDecoder();
    const input = new Uint8Array([0, 0, 62, 0, 0, 63, 0]);
    const output = textDecoder.decode(toBase64(input));
    expect(output).toMatchInlineSnapshot('"AAA+AAA/AA=="');

    const outputUrl = base64ToBase64url(output);
    expect(outputUrl).toMatchInlineSnapshot('"AAA-AAA_AA"');

    const output2 = base64FromBase64url(outputUrl);
    expect(output2).toEqual(output);
  });
});
