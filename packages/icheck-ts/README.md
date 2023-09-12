# icheck-ts

simpler [ts-prune](https://github.com/nadeesha/ts-prune) alternative.

## usage

<!--
%template-input-start:help%

```txt
$ icheck-ts --help
{%shell node ./bin/cli.js --help %}
```

%template-input-end:help%
-->

<!-- %template-output-start:help% -->

```txt
$ icheck-ts --help
icheck-ts/0.0.1-pre.4

Usage:
  $ icheck-ts [options] <files...>

Report unused exports

Positional arguments:
  files    Files to check exports

Options:
  --cache                Enable caching
  --cacheLocation=...    Cache directory location
  --cacheSize=...        LRU cache size
  --ignore=...           RegExp pattern to ignore export names
```

<!-- %template-output-end:help% -->

## features

- only dependency is `typescript` (`peerDependencies`) for parsing
- support `// icheck-ignore` to silence specific export line

### not supported

- namespace re-export usages are not checked (e.g. `export * from "./abc"`)
- no typescript custom resolution e.g. tsconfig `baseUrl`, `paths`, etc...

## development

```sh
# release
pnpm build
pnpm release

# run agianst fixtures
node ./bin/cli.js $(find fixtures/ytsub-v3/app -name '*.ts' -o -name '*.tsx')
```
