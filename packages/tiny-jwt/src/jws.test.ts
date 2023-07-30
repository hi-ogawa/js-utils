import { describe, expect, it } from "vitest";
import { jwsSign, jwsVerify } from "./jws";

describe("jws", () => {
  it("basic", async () => {
    const key = "asdfjkl;asdfjkl;asdfjkl;";
    const token = await jwsSign({
      header: { alg: "HS256" },
      payload: { hello: "world", utf: "콘솔🐈" },
      key,
    });
    expect(token).toMatchInlineSnapshot(
      '"eyJhbGciOiJIUzI1NiJ9.eyJoZWxsbyI6IndvcmxkIiwidXRmIjoi7L2Y7IaU8J-QiCJ9.1PVKyDo4Ew2zzdR9yUfGic2J8yddS5KJHUrBpYcjtao"'
    );

    const verified = await jwsVerify({ token, key, algorithms: ["HS256"] });
    expect(verified).toMatchInlineSnapshot(`
      {
        "header": {
          "alg": "HS256",
        },
        "payload": {
          "hello": "world",
          "utf": "콘솔🐈",
        },
      }
    `);
  });

  it("asymmetric", async () => {
    // pnpm -C packages/tiny-jwt cli keygen ES256
    const privateKey = {
      key_ops: ["sign"],
      ext: true,
      kty: "EC",
      x: "f91i57vK_SaXgPzCLTFmHgivjyO1QUlGlh080UVIer4",
      y: "wdwbAyOBvxuvdZ5uBOqJqucJYZ5uYPUgh2YYmSSI0Q8",
      crv: "P-256",
      d: "FB4GANwIzRg96QxuFkJziid0j31dxN0r5Vj2ZhflEjE",
    };
    const publicKey = {
      key_ops: ["verify"],
      ext: true,
      kty: "EC",
      x: "f91i57vK_SaXgPzCLTFmHgivjyO1QUlGlh080UVIer4",
      y: "wdwbAyOBvxuvdZ5uBOqJqucJYZ5uYPUgh2YYmSSI0Q8",
      crv: "P-256",
    };

    const payload = { hey: "you" };

    const token = await jwsSign({
      header: { alg: "ES256" },
      payload,
      key: privateKey,
    });

    const token2 = await jwsSign({
      header: { alg: "ES256" },
      payload,
      key: privateKey,
    });

    // ECDSA relies on random number internally and thus not deterministic
    // https://en.wikipedia.org/wiki/Elliptic_Curve_Digital_Signature_Algorithm
    expect(token).not.toBe(token2);

    const verified = await jwsVerify({
      token,
      key: publicKey,
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
