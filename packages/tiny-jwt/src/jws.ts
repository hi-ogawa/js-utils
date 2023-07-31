//
// JWS (json web signature) https://datatracker.ietf.org/doc/html/rfc7515
//

import { tinyassert } from "@hiogawa/utils";
import {
  decodeBase64url,
  decodeJson,
  encodeBase64url,
  encodeJson,
  encodeUtf8,
} from "./utils";

// JWA https://datatracker.ietf.org/doc/html/rfc7518#section-3.1
// prettier-ignore
const ALGORITHM_MAP = new Map<string, AlgorithmParams>([
  ["HS256", { name: "HMAC", hash: "SHA-256" }],
  ["ES256", { name: "ECDSA", hash: "SHA-256", namedCurve: "P-256" }],
  ["RS256", { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }],
]);

type AlgorithmParams =
  | HmacImportParams
  | (EcKeyImportParams & EcdsaParams)
  | RsaHashedImportParams;

export async function jwsSign({
  header,
  payload,
  key,
}: {
  header: { alg: string; [extra: string]: unknown }; // TODO: type "alg" literals
  payload: unknown;
  key: JsonWebKey;
}) {
  const algorithm = ALGORITHM_MAP.get(header.alg);
  tinyassert(algorithm, "unsupported 'alg'");

  // encode json
  const headerString = encodeJson(header);
  const payloadString = encodeJson(payload);
  const dataString = `${headerString}.${payloadString}`;

  // sign
  const signature = await cryptoSign({
    data: encodeUtf8(dataString),
    keyData: key,
    algorithm,
  });
  const signatureString = encodeBase64url(new Uint8Array(signature));

  // format token
  const token = `${dataString}.${signatureString}`;
  return token;
}

export async function jwsVerify({
  token,
  key,
  algorithms,
}: {
  token: string;
  key: JsonWebKey;
  algorithms: string[];
}) {
  // parse token
  const {
    0: headerString,
    1: payloadString,
    2: signatureString,
    length,
  } = token.split(".");
  tinyassert(length === 3, "invalid token format");

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
    keyData: key,
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
  keyData: JsonWebKey;
  algorithm: AlgorithmParams;
}): Promise<ArrayBuffer> {
  const key = await crypto.subtle.importKey("jwk", keyData, algorithm, false, [
    "sign",
  ]);
  return crypto.subtle.sign(algorithm, key, data);
}

async function cryptoVerify({
  data,
  signature,
  keyData,
  algorithm,
}: {
  data: Uint8Array;
  signature: Uint8Array;
  keyData: JsonWebKey;
  algorithm: AlgorithmParams;
}): Promise<boolean> {
  const key = await crypto.subtle.importKey("jwk", keyData, algorithm, false, [
    "verify",
  ]);
  return crypto.subtle.verify(algorithm, key, signature, data);
}
