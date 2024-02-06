// https://github.com/tc39/source-map-spec/blob/fbcf32ff81752a59dc659ba4e65a76f9a5b9d06b/source-map-rev3.md

import { range, splitByChunk } from "./lodash";

type DecodedSegment =
  | [number]
  | [number, number, number, number]
  | [number, number, number, number, number];

export type DecodedMappings = DecodedSegment[][];

export function decodeMappings(mappings: string): DecodedMappings {
  const groups = mappings
    ? mappings.split(";").map((line) => (line ? line.split(",") : []))
    : [];

  const result: DecodedMappings = [];
  const fields: DecodedSegment = [0, 0, 0, 0, 0];

  for (const group of groups) {
    fields[0] = 0;
    const decodedSegments: DecodedSegment[] = [];
    for (const segment of group) {
      let v: number;
      let j = 0;
      const decodedSegment: DecodedSegment = [] as any;
      for (let i = 0; i < segment.length; j++) {
        [i, v] = readVlqBase64(segment, i);
        fields[j] += v;
        decodedSegment.push(fields[j]);
      }
      if (!(j === 1 || j === 4 || j === 5)) {
        throw new Error(`invalid number of fields '${j}'`);
      }
      decodedSegments.push(decodedSegment);
    }
    result.push(decodedSegments);
  }
  return result;
}

export function encodeMappings(decoded: DecodedMappings): string {
  let mappings = "";

  const fields: DecodedSegment = [0, 0, 0, 0, 0];

  decoded.forEach((decodedSegments, i) => {
    if (i > 0) mappings += ";";
    fields[0] = 0;
    decodedSegments.forEach((decodedSegment, i) => {
      if (i > 0) mappings += ",";
      decodedSegment.forEach((v, i) => {
        mappings += writeVlqBase64(v - fields[i]);
        fields[i] = v;
      });
    });
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

function readVlqBase64(
  data: string,
  i: number
): [iNext: number, decoded: number] {
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
  const negative = y & 1;
  y >>>= 1;
  if (negative) {
    y = (1 << 31) | -y;
  }
  return [i, y];
}

function writeVlqBase64(y: number): string {
  let result = "";

  const negative = y < 0;
  y = negative ? -y : y;
  y <<= 1;
  if (negative) {
    y |= 1;
  }

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
