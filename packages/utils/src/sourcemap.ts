// https://github.com/tc39/source-map-spec/blob/fbcf32ff81752a59dc659ba4e65a76f9a5b9d06b/source-map-rev3.md
// https://github.com/jridgewell/sourcemap-codec/blob/f3d95b857d24fc3f1692dec4d1ed724fe12488a3/src/sourcemap-codec.ts

import { range, splitByChunk } from "./lodash";

type DecodedSegment =
  | [number]
  | [number, number, number, number]
  | [number, number, number, number, number];

export type DecodedMappings = DecodedSegment[][];

export function decodeMappings(mappings: string): DecodedMappings {
  const result: DecodedMappings = [];
  const fields: DecodedSegment = [0, 0, 0, 0, 0];

  for (let i = 0; i < mappings.length; i++) {
    const endGroup = indexOf(mappings, ";", i);
    const group: DecodedSegment[] = [];
    fields[0] = 0;
    while (i < endGroup) {
      const endSegment = Math.min(indexOf(mappings, ",", i), endGroup);
      const segment = [] as any as DecodedSegment;
      let j = 0;
      for (; i < endSegment; j++) {
        i = scanAndAddVlq(mappings, i, fields, j);
        segment.push(fields[j]);
      }
      if (!(j === 1 || j === 4 || j === 5)) {
        throw new Error(`invalid number of fields '${j}'`);
      }
      group.push(segment);
      if (i < endGroup) {
        i++;
      }
    }
    result.push(group);
  }

  return result;
}

function indexOf(data: string, search: string, position: number) {
  const i = data.indexOf(search, position);
  return i === -1 ? data.length : i;
}

export function encodeMappings(decoded: DecodedMappings): string {
  let mappings = "";

  const fields: DecodedSegment = [0, 0, 0, 0, 0];

  decoded.forEach((decodedSegments) => {
    fields[0] = 0;
    decodedSegments.forEach((decodedSegment, i) => {
      if (i > 0) mappings += ",";
      decodedSegment.forEach((v, i) => {
        mappings += formatVlq(v - fields[i]);
        fields[i] = v;
      });
    });
    mappings += ";";
  });

  return mappings;
}

const ENCODE64 = Array.from(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
  (c) => c.charCodeAt(0)
);

const DECODE64 = ENCODE64.reduce((acc, v, i) => {
  acc[v] = i;
  return acc;
}, Array(255).fill(-1));

const CONT_BIT = 1 << 5;
const CONT_MASK = CONT_BIT - 1;

function scanAndAddVlq(
  data: string,
  i: number,
  outArray: number[],
  outIndex: number
): number {
  let y = 0;
  for (let j = 0; ; j++) {
    if (j > 6) {
      throw new Error("invalid vlq over 32 bits");
    }
    const x = DECODE64[data.charCodeAt(i++)];
    y |= (x & CONT_MASK) << (j * 5);
    if ((x & CONT_BIT) === 0) {
      break;
    }
  }
  // sign at least significant bit
  y = y & 1 ? (1 << 31) | -(y >>> 1) : y >>> 1;
  outArray[outIndex] += y;
  return i;
}

function formatVlq(y: number): string {
  let result = "";

  y = y < 0 ? (-y << 1) | 1 : y << 1;

  for (let j = 0; ; j++) {
    if (j > 6) {
      throw new Error("invalid vlq over 32 bits");
    }
    let x = y & CONT_MASK;
    y >>>= 5;
    const cont = y !== 0;
    if (cont) {
      x |= CONT_BIT;
    }
    result += String.fromCharCode(ENCODE64[x]);
    if (!cont) {
      break;
    }
  }

  return result;
}

export function formatBin(x: number, size: number = 32, chunkSize: number = 8) {
  return splitByChunk(
    range(size)
      .reverse()
      .map((i) => (x >> i) & 1),
    chunkSize
  )
    .map((chunk) => chunk.join(""))
    .join("_");
}
