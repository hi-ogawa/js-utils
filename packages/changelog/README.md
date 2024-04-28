# changelog

Minimal `CHANGELOG.md` generator.

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
changelog/0.0.0

Usage:
  $ changelog [options]

Options:
  --from=...       (default: last commit modified CHANGELOG.md)
  --to=...         (default: HEAD)
  --dir=...        (default: process.cwd())
  --dry
  --removeScope
  --help, -h
```

<!-- %template-output-end:help% -->
