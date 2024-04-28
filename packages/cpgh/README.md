# cpgh

cli to copy github repo, similar to [degit](https://github.com/Rich-Harris/degit)

## usage

<!--
%template-input-start:help%

```txt
$ npx cpgh --help
{%shell node ./bin/cli.js --help %}
```

%template-input-end:help%
-->

<!-- %template-output-start:help% -->

```txt
$ npx cpgh --help
cpgh@0.0.1

Usage:
  npx cpgh https://github.com/<user>/<repo>/tree/<branch>/<subdir> <outdir>

Options:
  --force      Overwrite <outdir> if it exists
  -h, --help   Show help

Examples:
  npx cpgh https://github.com/vitest-dev/vitest/tree/main/examples/basic my-app
  npx cpgh https://github.com/vitest-dev/vitest/tree/this/is/branch[/]examples/basic my-app
```

<!-- %template-output-end:help% -->

## development

```sh
pnpm cli https://github.com/vitest-dev/vitest/tree/main /tmp/cpgh-dev
pnpm cli https://github.com/vitest-dev/vitest/tree/main/examples/basic /tmp/cpgh-dev
```
