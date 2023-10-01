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
@hiogawa/sort-package-json@0.0.0

Usage:
  sort-package-json [package.json files...]

Example:
  # sort package.json files in pnpm workspace
  sort-package-json $(pnpm ls --filter '*' --depth -1 --json | jq -r '.[] | .path' | xargs -i echo {}/package.json)
```

<!-- %template-output-end:help% -->
