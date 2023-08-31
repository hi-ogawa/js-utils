# inline-template

Based on four `%template-...:ID%` markers, `(OUTPUT)` will be replaced with `(INPUT)` after `{% (shell code) %}` interpolations are applied.

```txt
%template-input-start:ID%

...(INPUT with {% ... %})...

%template-input-end:ID%

%template-output-start:ID%

...(OUTPUT)...

%template-output-end:ID%
```

## examples

- [`packages/icheck-ts/README.md`](../icheck-ts/README.md?plain=1)
- [`packages/json-extra/README.md`](../json-extra/README.md?plain=1)
