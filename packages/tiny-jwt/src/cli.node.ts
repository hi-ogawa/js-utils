import "./polyfill.node";
import process from "node:process";
import { tinyassert } from "@hiogawa/utils";

const commands: Record<string, () => Promise<unknown>> = {
  HS256: async () => {
    const key = await crypto.subtle.generateKey(
      { name: "HMAC", hash: "SHA-256" },
      true,
      ["sign", "verify"]
    );
    const jwk = await crypto.subtle.exportKey("jwk", key);
    return jwk;
  },

  ES256: async () => {
    const keyPair = await crypto.subtle.generateKey(
      { name: "ECDSA", namedCurve: "P-256" },
      true,
      ["sign", "verify"]
    );
    const privateKey = await crypto.subtle.exportKey("jwk", keyPair.privateKey);
    const publicKey = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
    return { privateKey, publicKey };
  },

  A256GCM: async () => {
    const key = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
    const jwk = await crypto.subtle.exportKey("jwk", key);
    return jwk;
  },
};

async function main() {
  const [algorithm] = process.argv.slice(2);
  const commandFn = algorithm && commands[algorithm];
  tinyassert(
    commandFn,
    "supported algorithm: " + Object.keys(commands).join(", ")
  );
  const result = await commandFn();
  console.log(JSON.stringify(result, null, 2));
}

main();
