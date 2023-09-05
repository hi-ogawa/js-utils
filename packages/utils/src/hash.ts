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

// run `murmur3_32` for `n` times with different seed then return concatinated hex
export function hashString(
  input: string,
  n: number = 4,
  textEncoder = new TextEncoder(),
): string {
  let h = "";
  let seed = new Uint32Array([0x6a09e667]); // python -c 'import math; print(math.sqrt(2).hex())'
  const key = textEncoder.encode(input);
  for (let i = 0; i < n; i++) {
    h += murmur3_32(key, seed[0]).toString(16).padStart(8, "0");
    seed[0] = murmur3_32(new Uint8Array(seed.buffer), 0);
  }
  return h;
}

// https://en.wikipedia.org/wiki/MurmurHash#Algorithm
// fuzz test in packages/murmur3-wasm-bindgen/src-js/fuzz.test.ts
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
