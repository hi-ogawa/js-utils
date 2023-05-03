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
