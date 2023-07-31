# tiny-jwt

Minimal JWT library base on [`WebCrypto`](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) API.

See tests `./src/*.test.ts` for the usage.

```sh
# generate key in JWK format
tiny-jwt keygen HS256
{
  "key_ops": [
    "sign",
    "verify"
  ],
  "ext": true,
  "kty": "oct",
  "k": "eIlE_krFljjdMaGOEUHqTkvBgknkEQK_Q3VjMHDagJlde-36x1YXfjowvKs8mTSH6gJyml6HvW1qLhG75HOW_g",
  "alg": "HS256"
}
```

## todo

- [x] JWS (json web signature)
  - [x] HMAC (alg = HS256)
  - [x] ECDSA (alg = ES256)
- [x] JWE (json web encryption)
  - [x] AES-GCM (alg = dir, enc = A256GCM)
- [x] support `exp`
- [ ] more tests
- [x] demo cli (key generation, etc...)
- [ ] demo frontend

## references

- JWS https://datatracker.ietf.org/doc/html/rfc7515
- JWE https://datatracker.ietf.org/doc/html/rfc7516
- JWA https://datatracker.ietf.org/doc/html/rfc7518
- JWK https://datatracker.ietf.org/doc/html/rfc7517
- https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API
- https://nodejs.org/docs/latest-v18.x/api/webcrypto.html
- https://developers.cloudflare.com/workers/runtime-apis/web-crypto/
- https://github.com/hattipjs/hattip/blob/0001d4023eebb27cd6e127952a3ff00a2fdf425b/packages/middleware/session/src/crypto.ts
- https://github.com/remix-run/remix/blob/100ecd3ea686eeec14f17fa908116b74aebdb91c/packages/remix-cloudflare/crypto.ts
- https://github.com/auth0/node-jws/blob/b9fb8d30e9c009ade6379f308590f1b0703eefc3/lib/sign-stream.js
- https://github.com/panva/jose/blob/e2836e6aaaddecde053018884abb040908f186fd/src/runtime/browser/sign.ts
