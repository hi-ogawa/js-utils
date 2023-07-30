# tiny-jwt

Simple JWT library base on [`WebCrypto`](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) API.

```sh
pnpm build
pnpm release
```

## todo

- [x] JWS (json web signature)
  - [x] HMAC (alg = HS256)
  - [x] ECDSA (alg = ES256)
- [ ] JWE (json web encryption)
  - [ ] AES-GCM (alg = dir, enc = A128GCM)
- [ ] support `exp` and `ist`

## references

- https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API
- https://nodejs.org/docs/latest-v18.x/api/webcrypto.html
- https://developers.cloudflare.com/workers/runtime-apis/web-crypto/
