# inline-template

A simple templating system where both template input and output can be managed in a single file.

<!-- wrap <span>%</span> to avoid this code to be replaced -->
<pre>
<b><span>%</span>template-input-start:test%</b>

  Some text and {%shell ... %}

<b><span>%</span>template-input-end:test%</b>

<b>%template-output-start:test%</b>

  Anything inside this range will be replaced with above input and its shell code output

<b>%template-output-end:test%</b>
</pre>

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

Inspired by [mdocs](https://github.com/brillout/mdocs),
the primary purpose is to automatically update readme files,
which typically contain sample code and its output.

## examples

- [`packages/json-extra/README.md`](../json-extra/README.md?plain=1)
- [`packages/icheck-ts/README.md`](../icheck-ts/README.md?plain=1)
