import "./polyfill-node";
import process from "node:process";
import { ParseError, TinyCli, arg } from "@hiogawa/tiny-cli";
import { formatError, tinyassert } from "@hiogawa/utils";
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
    tinyassert(keygenFn, "unsupported algorithm: " + args.algorithm);
    const result = await keygenFn();
    console.log(JSON.stringify(result, null, 2));
  }
);

//
// main
//

async function main() {
  try {
    await cli.parse(process.argv.slice(2));
  } catch (e) {
    console.log(formatError(e, { noColor: !process.stdout.isTTY }));
    if (e instanceof ParseError) {
      console.log(
        "Please check '--help' for more information.\n\n" + cli.help()
      );
    }
    process.exit(1);
  }
}

main();
