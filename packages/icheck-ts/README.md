# icheck-ts

simpler [ts-prune](https://github.com/nadeesha/ts-prune) alternative.

## usage

```txt
$ icheck-ts --help
icheck-ts/0.0.1-pre.1

Usage:
  $ icheck-ts [options] <files...>

Lint import and export usages

Positional arguments:
  files    Typescript files to lint

Options:
  --cache         enable caching
  --ignore=...    RegExp pattern to ignore export names
  --debug         Debug output
```

## features

- only dependency is `typescript` (`peerDependencies`) for parsing
- support `// icheck-ignore` to silence specific export line

### not supported

- namespace re-export usages are not checked (e.g. `export * from "./abc"`)
- typescript custom resolution e.g. tsconfig `baseUrl`, `paths`, etc...

## development

```sh
# release
pnpm build
pnpm release

# run agianst fixtures
node ./bin/cli.js $(find fixtures/ytsub-v3/app -name '*.ts' -o -name '*.tsx')
```