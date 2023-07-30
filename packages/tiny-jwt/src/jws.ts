import { tinyassert } from "@hiogawa/utils";
import {
  decodeBase64url,
  decodeJson,
  encodeBase64url,
  encodeJson,
  encodeUtf8,
} from "./utils";

//
// jws (json web signature)
//
// cf.
// https://datatracker.ietf.org/doc/html/rfc7515
// https://github.com/remix-run/remix/blob/100ecd3ea686eeec14f17fa908116b74aebdb91c/packages/remix-cloudflare/crypto.ts#L14-L21
// https://github.com/auth0/node-jws/blob/b9fb8d30e9c009ade6379f308590f1b0703eefc3/lib/sign-stream.js
// https://github.com/panva/jose/blob/e2836e6aaaddecde053018884abb040908f186fd/src/runtime/browser/sign.ts
//

const ALGORITHM_MAP = new Map([["HS256", { name: "HMAC", hash: "SHA-256" }]]);

export async function jwsSign({
  header,
  payload,
  key,
}: {
  header: { alg: string };
  payload: unknown;
  key: string;
}) {
  const algorithm = ALGORITHM_MAP.get(header.alg);
  tinyassert(algorithm, "unsupported 'alg'");

  // encode data
  const headerString = encodeJson(header);
  const payloadString = encodeJson(payload);
  const dataString = `${headerString}.${payloadString}`;

  // sign
  const signature = await cryptoSign({
    data: encodeUtf8(dataString),
    keyData: encodeUtf8(key),
    algorithm,
  });
  const signatureString = encodeBase64url(signature);

  // return token
  const token = `${dataString}.${signatureString}`;
  return token;
}

export async function jwsVerify({
  token,
  key,
  algorithms,
}: {
  token: string;
  key: string;
  algorithms: string[];
}) {
  const {
    0: headerString,
    1: payloadString,
    2: signatureString,
    length,
  } = token.split(".");
  tinyassert(
    headerString && payloadString && signatureString && length === 3,
    "invalid token format"
  );

  // check header.alg
  const header = decodeJson(headerString);
  tinyassert(
    header &&
      typeof header === "object" &&
      "alg" in header &&
      typeof header.alg === "string",
    "invalid header 'alg'"
  );
  const algorithm = ALGORITHM_MAP.get(header.alg);
  tinyassert(algorithms.includes(header.alg), "disallowed 'alg'");
  tinyassert(algorithm, "unsupported 'alg'");

  // verify signature
  const dataString = `${headerString}.${payloadString}`;
  const isValid = cryptoVerify({
    data: encodeUtf8(dataString),
    keyData: encodeUtf8(key),
    signature: decodeBase64url(signatureString),
    algorithm,
  });
  tinyassert(isValid, "invalid signature");

  // return header and payload
  const payload = decodeJson(payloadString);
  return { header, payload };
}

//
// webcrypto wrapper
//

async function cryptoSign({
  data,
  keyData,
  algorithm,
}: {
  data: Uint8Array;
  keyData: Uint8Array;
  algorithm: HmacImportParams;
}): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", keyData, algorithm, false, [
    "sign",
  ]);
  const signature = await crypto.subtle.sign(key.algorithm.name, key, data);
  return new Uint8Array(signature);
}

async function cryptoVerify({
  data,
  signature,
  keyData,
  algorithm,
}: {
  data: Uint8Array;
  signature: Uint8Array;
  keyData: Uint8Array;
  algorithm: HmacImportParams;
}): Promise<boolean> {
  const key = await crypto.subtle.importKey("raw", keyData, algorithm, false, [
    "verify",
  ]);
  return await crypto.subtle.verify(key.algorithm.name, key, signature, data);
}
