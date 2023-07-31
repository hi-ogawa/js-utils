// webcrypto is globally available only from node 20
// https://nodejs.org/docs/latest-v18.x/api/webcrypto.html
// https://nodejs.org/docs/latest-v20.x/api/webcrypto.html
// https://github.com/hattipjs/hattip/blob/0001d4023eebb27cd6e127952a3ff00a2fdf425b/packages/base/polyfills/src/crypto.ts#L3-L10

import crypto from "node:crypto";

if (typeof globalThis.crypto === "undefined") {
  globalThis.crypto = crypto.webcrypto as any;
}
