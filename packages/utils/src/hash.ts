
// https://nullprogram.com/blog/2018/07/31/
export function hashInt32(x: number) {
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
    this.state = hashInt32(seed);
  }

  int32(): number {
    return this.state = hashInt32(this.state);
  }

  uniform() {
    return this.int32() / 2 ** 32;
  }
}
