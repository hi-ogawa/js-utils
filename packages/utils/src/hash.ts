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
  // read to Uint8Array
  const encoder = new TextEncoder();
  const u8Array = encoder.encode(input);

  // convert to Uint32Array after padding
  const u8ArrayPad = new Uint8Array(Math.ceil(u8Array.length / 4) * 4);
  u8ArrayPad.set(u8Array);
  const u32Array = new Uint32Array(u8ArrayPad.buffer);

  // iterate on 32 bits x 4
  const xs = new Uint32Array(range(4).map((i) => hashInt32(i + 1)));
  for (const i of range(u32Array.length)) {
    xs[0] = hashInt32(xs[3] ^ u32Array[i]);
    xs[1] = hashInt32(xs[0] ^ u32Array[i]);
    xs[2] = hashInt32(xs[1] ^ u32Array[i]);
    xs[3] = hashInt32(xs[2] ^ u32Array[i]);
  }

  // format to hex (4bits) x 32
  return Array.from(xs, (x) => x.toString(16).padStart(8, "0")).join("");
}
