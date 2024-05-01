# changelog

Minimal `CHANGELOG.md` generator.

## usage

<!--
%template-input-start:help%

```txt
$ npx @hiogawa/changelog --help
{%shell node ./bin/cli.js --help %}
```

%template-input-end:help%
-->

<!-- %template-output-start:help% -->

```txt
$ npx @hiogawa/changelog --help
changelog/0.0.0-pre.0

Usage:
  $ changelog [options]

Generate or update CHANGELOG.md based on git commits

Options:
  --from           (default: last commit modified CHANGELOG.md)
  --to             (default: HEAD)
  --dir            (default: process.cwd())
  --dry
  --removeScope
  -h, --help
```

<!-- %template-output-end:help% -->
