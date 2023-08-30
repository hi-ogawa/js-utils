# inline-template

Based on four `%template-...:ID%` markers, `(OUTPUT)` will be replaced with `(INPUT)` after `{% (shell code) %}` interpolations are applied.
For example, this is useful for generating `README.md`.

## usages

<!--
%template-in-begin:help%

```txt
$ inline-template --help
{% node ./bin/cli.js --help %}
```

%template-in-end:help%
-->

<!-- %template-out-begin:help% -->

```txt
$ inline-template --help
inline-template/0.0.0

Usage:
  $ inline-template [options] <file>

Expand inline template

Positional arguments:
  file    Input file

Options:
  --inplace    Update file in-place
  --cwd=...    Working directory to execute shell code interpolation
```

<!-- %template-out-end:help% -->

## examples

- [`packages/inline-template/README.md`](./README.md?plain=1)
- [`packages/icheck-ts/README.md`](../icheck-ts/README.md?plain=1)
- [`packages/json-extra/README.md`](../json-extra/README.md?plain=1)
