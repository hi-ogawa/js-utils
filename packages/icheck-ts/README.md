# icheck-ts

simpler [ts-prune](https://github.com/nadeesha/ts-prune) alternative.

## usage

<!--
%template-input-start:help%

```txt
$ icheck-ts --help
{%shell node ./bin/cli.js --help %}

$ icheck-ts fixtures/cli/*.ts
{%shell node ./bin/cli.js fixtures/cli/*.ts %}
```

%template-input-end:help%
-->

<!-- %template-output-start:help% -->

```txt
$ icheck-ts --help
icheck-ts/0.0.1-pre.21

Usage:
  $ icheck-ts [options] <files...>

Report unused exports

Positional arguments:
  files    Files to check exports

Options:
  --cache                   Enable caching
  --cacheLocation=...       Cache directory location
  --cacheSize=...           LRU cache size
  --ignore=...              RegExp pattern to ignore export names
  --ignoreUnresolved=...    RegExp pattern to ignore unresolved import
  --noCheckCircular         Disable checking circular import
  --noCheckUnresolved       Disable checking unresolved import
  --useImportMetaResolve    Use import.meta.resolve for module resolution

$ icheck-ts fixtures/cli/*.ts
** Unused exports **
fixtures/cli/x2.ts:2 - b
** Circular imports **
fixtures/cli/cycle4.ts:1 - x
 -> fixtures/cli/cycle2.ts:1 - (side effect)
     -> fixtures/cli/cycle3.ts:1 - *
```

<!-- %template-output-end:help% -->

## features

- check unused exports
- check circular dependencies
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

# dev
pnpm cli $(find fixtures/resolve -type f)
pnpm cli-tsx $(find fixtures/resolve -type f)
pnpm cli-tsx-dev $(find fixtures/resolve -type f)
pnpm cli-tsx-dev --useImportMetaResolve $(find fixtures/resolve -type f)
```
