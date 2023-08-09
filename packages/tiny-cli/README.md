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

- command option alias
- automatic program version flag
- special arguments e.g. `--`

## examples

- https://github.com/hi-ogawa/isort-ts/blob/dc95b781cde4b5c7998fc69219fb11eaf055a339/src/cli.ts
