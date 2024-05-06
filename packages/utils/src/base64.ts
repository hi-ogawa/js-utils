// ported from https://github.com/hi-ogawa/base64

// map 6 bits [0, 64) into ascii byte (8 bits)
// generated by
//   Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", c => c.charCodeAt(0))
// biome-ignore format:
const ENC = new Uint8Array([
  65,  66,  67,  68,  69,  70,  71,  72,  73,  74,  75,  76,
  77,  78,  79,  80,  81,  82,  83,  84,  85,  86,  87,  88,
  89,  90,  97,  98,  99, 100, 101, 102, 103, 104, 105, 106,
 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118,
 119, 120, 121, 122,  48,  49,  50,  51,  52,  53,  54,  55,
  56,  57,  43,  47
]);

// "=".codePointAt(0)
const ENC_PAD = 61;

// inverse of ENC
// generated by
//   ENC.reduce((acc, v, i) => { acc[v] = i; return acc }, Array(255).fill(100))
// biome-ignore format:
const DEC = new Uint8Array([
  100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
  100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
  100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
  100, 100, 100, 100, 100, 100, 100,  62, 100, 100, 100,  63,
   52,  53,  54,  55,  56,  57,  58,  59,  60,  61, 100, 100,
  100, 100, 100, 100, 100,   0,   1,   2,   3,   4,   5,   6,
    7,   8,   9,  10,  11,  12,  13,  14,  15,  16,  17,  18,
   19,  20,  21,  22,  23,  24,  25, 100, 100, 100, 100, 100,
  100,  26,  27,  28,  29,  30,  31,  32,  33,  34,  35,  36,
   37,  38,  39,  40,  41,  42,  43,  44,  45,  46,  47,  48,
   49,  50,  51, 100, 100, 100, 100, 100, 100, 100, 100, 100,
  100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
  100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
  100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
  100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
  100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
  100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
  100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
  100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
  100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
  100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
  100, 100, 100
]);

export function toBase64(xs: Uint8Array): Uint8Array {
  const xLen = xs.length;
  const ys = new Uint8Array(Math.ceil(xLen / 3) * 4);
  const chunkLen = Math.floor(xLen / 3);

  // encode complete chunks
  for (let i = 0; i < chunkLen; i++) {
    const c = (xs[3 * i + 0] << 16) | (xs[3 * i + 1] << 8) | xs[3 * i + 2];
    ys[4 * i + 0] = ENC[(c >> 18) & 0b111111];
    ys[4 * i + 1] = ENC[(c >> 12) & 0b111111];
    ys[4 * i + 2] = ENC[(c >> 6) & 0b111111];
    ys[4 * i + 3] = ENC[(c >> 0) & 0b111111];
  }

  // encode partial chunk with padding
  const i = chunkLen;
  switch (xLen % 3) {
    case 1: {
      const c = xs[3 * i + 0] << 16;
      ys[4 * i + 0] = ENC[(c >> 18) & 0b111111];
      ys[4 * i + 1] = ENC[(c >> 12) & 0b111111];
      ys[4 * i + 2] = ENC_PAD;
      ys[4 * i + 3] = ENC_PAD;
      break;
    }
    case 2: {
      const c = (xs[3 * i + 0] << 16) | (xs[3 * i + 1] << 8);
      ys[4 * i + 0] = ENC[(c >> 18) & 0b111111];
      ys[4 * i + 1] = ENC[(c >> 12) & 0b111111];
      ys[4 * i + 2] = ENC[(c >> 6) & 0b111111];
      ys[4 * i + 3] = ENC_PAD;
      break;
    }
  }

  return ys;
}

export function fromBase64(ys: Uint8Array): Uint8Array {
  const yLen = ys.length;

  // validate length
  if (yLen % 4 !== 0) {
    throw new Error("invalid length");
  }

  // get padding length
  let padLen = 0;
  while (
    padLen < 2 &&
    padLen < ys.length &&
    ys[ys.length - 1 - padLen] === ENC_PAD
  ) {
    padLen++;
  }

  // validate encoding
  for (let i = 0; i < ys.length - padLen; i++) {
    if (DEC[ys[i]] >= 64) {
      throw new Error("invalid data");
    }
  }

  // validate encoding
  const chunkLen = Math.floor((yLen - padLen) / 4);
  const xLen = 3 * chunkLen + ((3 - padLen) % 3);
  const xs = new Uint8Array(xLen);

  // decode complete chunks
  for (let i = 0; i < chunkLen; i++) {
    const c =
      (DEC[ys[4 * i + 0]] << 18) |
      (DEC[ys[4 * i + 1]] << 12) |
      (DEC[ys[4 * i + 2]] << 6) |
      (DEC[ys[4 * i + 3]] << 0);
    xs[3 * i] = (c >> 16) & 0xff;
    xs[3 * i + 1] = (c >> 8) & 0xff;
    xs[3 * i + 2] = (c >> 0) & 0xff;
  }

  // decode partial chunk
  const i = chunkLen;
  switch (xLen % 3) {
    case 1: {
      const c = (DEC[ys[4 * i + 0]] << 18) | (DEC[ys[4 * i + 1]] << 12);
      xs[3 * i] = (c >> 16) & 0xff;
      break;
    }
    case 2: {
      const c =
        (DEC[ys[4 * i + 0]] << 18) |
        (DEC[ys[4 * i + 1]] << 12) |
        (DEC[ys[4 * i + 2]] << 6);
      xs[3 * i] = (c >> 16) & 0xff;
      xs[3 * i + 1] = (c >> 8) & 0xff;
      break;
    }
  }

  return xs;
}

//
// base64url
// https://datatracker.ietf.org/doc/html/rfc7515#appendix-C
//

export function base64ToBase64url(base64: string): string {
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function base64FromBase64url(base64url: string): string {
  return (
    base64url.replace(/-/g, "+").replace(/_/g, "/") +
    "=".repeat((4 - (base64url.length % 4)) % 4)
  );
}
