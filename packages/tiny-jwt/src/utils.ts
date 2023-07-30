export function encodeJson(v: unknown) {
  return encodeBase64url(encodeUtf8(JSON.stringify(v)));
}

export function decodeJson(v: string): unknown {
  return JSON.parse(decodeUtf8(decodeBase64url(v)));
}

//
// string <-> buffer
//

export const encodeUtf8 = (v: string) => new TextEncoder().encode(v);
export const decodeUtf8 = (v: BufferSource) => new TextDecoder().decode(v);

//
// base64url string <-> buffer
// https://developer.mozilla.org/en-US/docs/Glossary/Base64#the_unicode_problem)
// https://datatracker.ietf.org/doc/html/rfc7515#appendix-C
//

export function encodeBase64url(buffer: Uint8Array): string {
  const binString = Array.from(buffer, (c) => String.fromCharCode(c)).join("");
  const base64 = btoa(binString);
  const base64url = base64
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
  return base64url;
}

export function decodeBase64url(base64url: string): Uint8Array {
  // `atob` can handle without padding
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const binString = atob(base64);
  const buffer = Uint8Array.from(binString, (c) => c.charCodeAt(0)!);
  return buffer;
}
