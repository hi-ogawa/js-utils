# icheck-ts

simpler [ts-prune](https://github.com/nadeesha/ts-prune) alternative.

## features

- requires only `typescript` as `peerDependencies`
- `// icheck-ignore`
- `--ignore <RegExp>`

## development

```sh
# release
pnpm build
pnpm release

# run agianst fixtures
node ./bin/cli.js $(find fixtures/ytsub-v3/app -name '*.ts' -o -name '*.tsx')
```
