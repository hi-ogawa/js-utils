import { tinyassert } from "@hiogawa/utils";

// https://datatracker.ietf.org/doc/html/rfc7519#section-4.1.4
export function setExpirationTime(expiresInSecond: number) {
  const exp = Math.ceil(Date.now() / 1000 + expiresInSecond);
  return { exp };
}

// TODO: allow clock skew?
export function checkExpirationTime(header: unknown) {
  tinyassert(
    header &&
      typeof header === "object" &&
      "exp" in header &&
      typeof header.exp === "number",
    "invalid token"
  );
  tinyassert(Date.now() / 1000 < header.exp, "token expired");
}
