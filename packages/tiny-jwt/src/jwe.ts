//
// JWE (json web encryption) https://datatracker.ietf.org/doc/html/rfc7516
//

import { tinyassert, wrapError } from "@hiogawa/utils";
import {
  decodeBase64url,
  decodeJson,
  decodeUtf8,
  encodeBase64url,
  encodeJson,
  encodeUtf8,
} from "./utils";

// JWK https://datatracker.ietf.org/doc/html/rfc7518#section-5.1
// support only A256GCM for starter

const JWE_ENC = "A256GCM" as const;

const CRYPTO_ALGORITHM = {
  name: "AES-GCM",
  length: 256,
} satisfies AesKeyAlgorithm;

const CRYPTO_ENCRYPTION_PARAM = {
  name: "AES-GCM",
  tagLength: 128,
} satisfies Pick<AesGcmParams, "name" | "tagLength">;

// https://datatracker.ietf.org/doc/html/rfc7516#section-5.1
// https://datatracker.ietf.org/doc/html/rfc7516#appendix-A.1
export async function jweEncrypt({
  header,
  payload,
  key,
}: {
  header: { alg: "dir"; enc: typeof JWE_ENC; [extra: string]: unknown };
  payload: unknown;
  key: string;
}) {
  // encode json
  const headerString = encodeJson(header);
  const payloadString = encodeJson(payload);

  // encrypt
  const keyData = processKey(key);
  const encryptedKeyString = ""; // empty for alg = "dir"
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const { ciphertext, tag } = await cryptoEncrypt({
    data: encodeUtf8(payloadString),
    keyData,
    additionalData: encodeUtf8(headerString),
    iv,
  });

  // format token
  const ivString = encodeBase64url(iv);
  const ciphertextString = encodeBase64url(new Uint8Array(ciphertext));
  const tagString = encodeBase64url(new Uint8Array(tag));
  const token = [
    headerString,
    encryptedKeyString,
    ivString,
    ciphertextString,
    tagString,
  ].join(".");
  return token;
}

// https://datatracker.ietf.org/doc/html/rfc7516#section-5.2
export async function jweDecrypt({
  token,
  key,
}: {
  token: string;
  key: string;
}) {
  // parse token
  const {
    0: headerString,
    1: encryptedKeyString,
    2: ivString,
    3: ciphertextString,
    4: tagString,
    length,
  } = token.split(".");
  tinyassert(length === 5, "invalid token format");
  tinyassert(encryptedKeyString.length === 0, "'encrypted key' must be empty");

  // decrypt
  const keyData = processKey(key);
  const iv = decodeBase64url(ivString);
  const ciphertext = decodeBase64url(ciphertextString);
  const tag = decodeBase64url(tagString);
  const data = await cryptoDecrypt({
    ciphertext,
    tag,
    keyData,
    additionalData: encodeUtf8(headerString),
    iv,
  });

  // return header and payload
  const header = decodeJson(headerString);
  const payload = decodeJson(decodeUtf8(data));
  return { header, payload };
}

function processKey(key: string) {
  const keyData = wrapError(() => {
    const keyData = decodeBase64url(key);
    tinyassert(keyData.byteLength === 256 / 8);
    return keyData;
  });
  tinyassert(
    keyData.ok,
    "'key' must be base64url-encoded and 256 bits (32 bytes)"
  );
  return keyData.value;
}

//
// webcrypto wrapper
//

async function cryptoEncrypt({
  data,
  keyData,
  iv,
  additionalData,
}: {
  data: BufferSource;
  keyData: BufferSource;
  iv: BufferSource;
  additionalData: BufferSource;
}) {
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    CRYPTO_ALGORITHM,
    false,
    ["encrypt"]
  );

  const encryptParam = {
    ...CRYPTO_ENCRYPTION_PARAM,
    iv,
    additionalData,
  } satisfies AesGcmParams;

  const encrypted = await crypto.subtle.encrypt(encryptParam, key, data);

  // split out tag
  const tagLength = encryptParam.tagLength / 8;
  const ciphertext = encrypted.slice(0, -tagLength);
  const tag = encrypted.slice(-tagLength);
  return { ciphertext, tag };
}

async function cryptoDecrypt({
  ciphertext,
  tag,
  keyData,
  iv,
  additionalData,
}: {
  ciphertext: Uint8Array;
  tag: Uint8Array;
  keyData: BufferSource;
  iv: BufferSource;
  additionalData: BufferSource;
}) {
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    CRYPTO_ALGORITHM,
    false,
    ["decrypt"]
  );

  const encryptParam = {
    ...CRYPTO_ENCRYPTION_PARAM,
    iv,
    additionalData,
  } satisfies AesGcmParams;

  // concat tag
  const tagLength = encryptParam.tagLength / 8;
  tinyassert(tag.length === tagLength, "invalid 'tag' length");
  const data = new Uint8Array(ciphertext.byteLength + tag.byteLength);
  data.set(ciphertext, 0);
  data.set(tag, ciphertext.byteLength);

  const decrypted = await crypto.subtle.decrypt(encryptParam, key, data);
  return decrypted;
}
