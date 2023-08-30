# inline-template

Based on four `%template-...:ID%` markers, `(OUTPUT)` will be replaced with `(INPUT)` after `{% (shell code) %}` interpolations are applied.

```txt
%template-in-begin:ID%

...(INPUT with {% ... %})...

%template-in-end:ID%

%template-out-begin:ID%

...(OUTPUT)...

%template-out-end:ID%
```

## examples

- [`packages/icheck-ts/README.md`](../icheck-ts/README.md?plain=1)
- [`packages/json-extra/README.md`](../json-extra/README.md?plain=1)
