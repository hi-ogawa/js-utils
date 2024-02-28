# inline-template

A simple templating system where both template input and output can be managed in a single file.

Inspired by [mdocs](https://github.com/brillout/mdocs),
the primary purpose is to automatically update readme files,
which typically contain sample code and its output.

See how this `--help` is generated in [`./README.md`](./README.md?plain=1).

<!--
%template-input-start:1%

```txt
$ inline-template --help
{%shell pnpm -s cli --help %}
```

%template-input-end:1%
-->

<!-- %template-output-start:1% -->

```txt
$ inline-template --help
inline-template/0.0.1-pre.4

Usage:
  $ inline-template [options] <file>

Expand inline template

Positional arguments:
  file    Input file

Options:
  --dry        Print instead of updating in-place
  --cwd=...    Working directory to execute shell code interpolation
```

<!-- %template-output-end:1% -->

## examples

- [`packages/json-extra/README.md`](../json-extra/README.md?plain=1)
- [`packages/icheck-ts/README.md`](../icheck-ts/README.md?plain=1)
