import { range } from "./lodash";

// https://nullprogram.com/blog/2018/07/31/
export function hashInt32(x: number): number {
  x ^= x >>> 16;
  x = Math.imul(x, 0x21f0aaad);
  x ^= x >>> 15;
  x = Math.imul(x, 0xd35a2d97);
  x ^= x >>> 15;
  return x >>> 0;
}

export class HashRng {
  private state: number;

  constructor(seed: number) {
    this.state = hashInt32(seed | 1);
  }

  int32(): number {
    return (this.state = hashInt32(this.state));
  }

  float(): number {
    return this.int32() / 2 ** 32;
  }
}

/** @deprecated this is only a toy ideaa and shouldn't be used... */
export function hashString(input: string): string {
  // iterate on 32 bits x 4
  const xs = new Uint32Array(range(4).map((i) => hashInt32(i + 1)));
  for (const i of range(input.length)) {
    const c = input.codePointAt(i) ?? 0;
    xs[0] = hashInt32(xs[3] ^ c);
    xs[1] = hashInt32(xs[0] ^ c);
    xs[2] = hashInt32(xs[1] ^ c);
    xs[3] = hashInt32(xs[2] ^ c);
  }

  // format to hex (4bits) x 32
  return Array.from(xs, (x) => x.toString(16).padStart(8, "0")).join("");
}

export function hashString_murmur3_32(
  input: string,
  seed?: number,
  textEncoder?: TextEncoder
): number {
  seed ??= 0;
  textEncoder ??= new TextEncoder();
  const key = textEncoder.encode(input);
  return murmur3_32(key, seed);
}

// https://en.wikipedia.org/wiki/MurmurHash#Algorithm
export function murmur3_32(key: Uint8Array, seed: number): number {
  const len = key.length;
  let h = seed;
  let i = 0;

  while (i < len - (len % 4)) {
    const k = key[i++] | (key[i++] << 8) | (key[i++] << 16) | (key[i++] << 24);
    h ^= murmur3_32_scramble(k);
    h = (h << 13) | (h >>> 19);
    h = (Math.imul(h, 5) >>> 0) + 0xe6546b64;
    h >>>= 0;
  }
  h ^= murmur3_32_scramble(key[i++] | (key[i++] << 8) | (key[i++] << 16));

  h ^= len;
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

function murmur3_32_scramble(k: number) {
  k = Math.imul(k, 0xcc9e2d51);
  k = (k << 15) | (k >>> 17);
  k = Math.imul(k, 0x1b873593);
  return k >>> 0;
}
