import { beforeEach, describe, expect, it, vi } from "vitest";
import { checkExpirationTime, setExpirationTime } from "./claim";
import { jwsSign, jwsVerify } from "./jws";

describe("token expiration", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    return () => {
      vi.useRealTimers();
    };
  });

  it("basic", async () => {
    const key = {
      kty: "oct",
      k: "eIlE_krFljjdMaGOEUHqTkvBgknkEQK_Q3VjMHDagJlde-36x1YXfjowvKs8mTSH6gJyml6HvW1qLhG75HOW_g",
    };

    // expires in 15 min
    vi.setSystemTime(0);
    const token = await jwsSign({
      header: { alg: "HS256", ...setExpirationTime(15 * 60) },
      payload: { hey: "you" },
      key,
    });
    expect(token).toMatchInlineSnapshot(
      '"eyJhbGciOiJIUzI1NiIsImV4cCI6OTAwfQ.eyJoZXkiOiJ5b3UifQ.WEXMeyfyRgoQHtZN8ZWuaG4ZoXKhSXDtGqq-icTmWvs"',
    );

    const verified = await jwsVerify({
      token,
      key,
      algorithms: ["HS256"],
    });
    expect(verified).toMatchInlineSnapshot(`
      {
        "header": {
          "alg": "HS256",
          "exp": 900,
        },
        "payload": {
          "hey": "you",
        },
      }
    `);

    // valid after 10 min
    vi.setSystemTime(10 * 60 * 1000);
    checkExpirationTime(verified.header);

    // invalid after 20 min
    vi.setSystemTime(20 * 60 * 1000);
    expect(() =>
      checkExpirationTime(verified.header),
    ).toThrowErrorMatchingInlineSnapshot(`[Error: token expired]`);
  });
});
