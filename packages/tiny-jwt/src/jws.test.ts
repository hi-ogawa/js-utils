import { describe, expect, it } from "vitest";
import { jwsSign, jwsVerify } from "./jws";

describe("jws", () => {
  it("HS256", async () => {
    // pnpm -C packages/tiny-jwt cli keygen HS256
    const key = {
      key_ops: ["sign", "verify"],
      ext: true,
      kty: "oct",
      k: "eIlE_krFljjdMaGOEUHqTkvBgknkEQK_Q3VjMHDagJlde-36x1YXfjowvKs8mTSH6gJyml6HvW1qLhG75HOW_g",
      alg: "HS256",
    };
    const token = await jwsSign({
      header: { alg: "HS256" },
      payload: { hey: "you", utf: "콘솔🐈" },
      key,
    });
    expect(token).toMatchInlineSnapshot(
      '"eyJhbGciOiJIUzI1NiJ9.eyJoZXkiOiJ5b3UifQ.zwCZQg-jtThm6JYlG8myyCBI0dKqkiiUEoljqBntTPs"'
    );
    const verified = await jwsVerify({ token, key, algorithms: ["HS256"] });
    expect(verified).toMatchInlineSnapshot(`
      {
        "header": {
          "alg": "HS256",
        },
        "payload": {
          "hey": "you",
        },
      }
    `);
  });

  it("ES256", async () => {
    // pnpm -C packages/tiny-jwt cli keygen ES256
    const keyPair = {
      privateKey: {
        key_ops: ["sign"],
        ext: true,
        kty: "EC",
        x: "9kt7B8n3bZd75-TDaolIZX8TAYX01ZoYb8--elqkmAE",
        y: "dORjOTold2oujeyBo1FF9mDHEX8f3j68hcd64DhMHpQ",
        crv: "P-256",
        d: "yZPwEOZwEyyB7F_drblZ9QqdXHRT1-rrUfC7GzSMFvk",
      },
      publicKey: {
        key_ops: ["verify"],
        ext: true,
        kty: "EC",
        x: "9kt7B8n3bZd75-TDaolIZX8TAYX01ZoYb8--elqkmAE",
        y: "dORjOTold2oujeyBo1FF9mDHEX8f3j68hcd64DhMHpQ",
        crv: "P-256",
      },
    };

    const payload = { hey: "you" };

    const token = await jwsSign({
      header: { alg: "ES256" },
      payload,
      key: keyPair.privateKey,
    });

    const token2 = await jwsSign({
      header: { alg: "ES256" },
      payload,
      key: keyPair.privateKey,
    });

    // ECDSA relies on random number internally and thus not deterministic
    // https://en.wikipedia.org/wiki/Elliptic_Curve_Digital_Signature_Algorithm
    expect(token).not.toBe(token2);

    const verified = await jwsVerify({
      token,
      key: keyPair.publicKey,
      algorithms: ["ES256"],
    });
    expect(verified).toMatchInlineSnapshot(`
      {
        "header": {
          "alg": "ES256",
        },
        "payload": {
          "hey": "you",
        },
      }
    `);
  });
});
