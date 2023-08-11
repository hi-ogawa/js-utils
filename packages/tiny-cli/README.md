# tiny-cli

simple type-safe command line parsing library

## features

- type-safety/inference of command handler function
- automatic help generation
- variadic arguments
- sub commands
- zero dependencies
- ability to reuse zod schema `z.ZodType<T>`

## not supported

- short form option e.g. `-h`
- command option alias
- transform option key from kebab-case to camelCase
- special arguments e.g. `--`

## examples

- https://github.com/hi-ogawa/isort-ts/blob/dc95b781cde4b5c7998fc69219fb11eaf055a339/src/cli.ts
- https://github.com/hi-ogawa/ytsub-v3/blob/08e3aed9a8be3472c7b4d0f61a978e546c75eeb8/app/misc/cli.ts
- see also various tests `./src/*.test.ts`
