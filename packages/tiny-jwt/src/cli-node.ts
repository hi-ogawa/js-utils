import "./polyfill-node";
import {
  TinyCli,
  TinyCliParseError,
  arg,
  tinyCliMain,
} from "@hiogawa/tiny-cli";
import { version } from "../package.json";

const cli = new TinyCli({
  program: "tiny-jwt",
  version,
});

//
// keygen
//

const keygenFns: Record<string, () => Promise<unknown>> = {
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

cli.defineCommand(
  {
    name: "keygen",
    args: {
      algorithm: arg.string(Object.keys(keygenFns).join(", "), {
        positional: true,
      }),
    },
  },
  async ({ args }) => {
    const keygenFn = keygenFns[args.algorithm];
    if (!keygenFn) {
      throw new TinyCliParseError("unsupported algorithm: " + args.algorithm);
    }
    const result = await keygenFn();
    console.log(JSON.stringify(result, null, 2));
  }
);

//
// main
//

tinyCliMain(cli);
