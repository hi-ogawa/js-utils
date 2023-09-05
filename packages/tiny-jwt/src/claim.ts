import { tinyassert } from "@hiogawa/utils";

// "exp" claim https://datatracker.ietf.org/doc/html/rfc7519#section-4.1.4

/**
 * @param maxAge similar to cookie "Max-Age" https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#max-agenumber
 */
export function setExpirationTime(maxAge: number) {
  return { exp: Math.ceil(Date.now() / 1000 + maxAge) };
}

// TODO: allow clock skew?
export function checkExpirationTime(header: unknown) {
  tinyassert(
    header &&
      typeof header === "object" &&
      "exp" in header &&
      typeof header.exp === "number",
    "invalid token",
  );
  tinyassert(Date.now() / 1000 < header.exp, "token expired");
}
