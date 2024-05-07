import { tinyassert } from "@hiogawa/utils";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { jweDecrypt, jweEncrypt } from "./jwe";

beforeAll(() => {
  // deterministic "iv" (initialization vector)
  let i = 0;
  vi.spyOn(crypto, "getRandomValues").mockImplementation((arr) => {
    tinyassert(arr);
    new Uint8Array(arr.buffer).fill(i++);
    return arr;
  });
  return () => {
    vi.restoreAllMocks();
  };
});

describe("jwe", () => {
  it("basic", async () => {
    // pnpm -C packages/tiny-jwt cli keygen A256GCM
    const key = {
      key_ops: ["encrypt", "decrypt"],
      ext: true,
      kty: "oct",
      k: "vc43dP6oKb7nnjt-YFgLbZ1R3ItaJLvPicVasAGwOPA",
      alg: "A256GCM",
    };
    const header = { alg: "dir", enc: "A256GCM" } as const;
    const payload = { hey: "you".repeat(5) };

    const token = await jweEncrypt({
      header,
      payload,
      key,
    });
    const token2 = await jweEncrypt({
      header,
      payload,
      key,
    });

    // each token should be different due to "iv" (initialization vector)
    expect(token).toMatchInlineSnapshot(
      '"eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..AAAAAAAAAAAAAAAA.3o6Vw6RfwfDV89a5cQmApxsS52iPP4ZxnNqjpgSMJchoWA.9cWxaNtVez7PpfzFkLexnQ"',
    );
    expect(token2).toMatchInlineSnapshot(
      '"eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..AQEBAQEBAQEBAQEB.O9Mhj210k_ROwP3woiC2jrhWFlEf_ZlR2g1xkTccDKcH7g.dDcdAnisfjLMWBwy4P3eAg"',
    );

    const decrypted = await jweDecrypt({
      token,
      key,
    });
    expect(decrypted).toMatchInlineSnapshot(`
      {
        "header": {
          "alg": "dir",
          "enc": "A256GCM",
        },
        "payload": {
          "hey": "youyouyouyouyou",
        },
      }
    `);
  });
});
