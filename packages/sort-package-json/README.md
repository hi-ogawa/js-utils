# sort-package-json

Slim version of https://github.com/keithamus/sort-package-json

## usage

<!--
%template-input-start:help%

```txt
$ sort-package-json --help
{%shell node ./bin/cli.js --help %}
```

%template-input-end:help%
-->

<!-- %template-output-start:help% -->

```txt
$ sort-package-json --help
@hiogawa/sort-package-json@0.0.2

Usage:
  sort-package-json [paths to directories or package.json files]

Examples:
  # Sort all package.json files in pnpm workspace
  sort-package-json $(pnpm ls --filter '*' --depth -1 --json | jq -r '.[] | .path')
```

<!-- %template-output-end:help% -->

## development

```sh
pnpm i
pnpm scrape
pnpm build
pnpm doc
pnpm release
```
