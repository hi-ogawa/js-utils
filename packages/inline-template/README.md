# inline-template

Based on four `%template-...:ID%` markers, `(OUTPUT)` will be replaced with `(INPUT)` after `{% (shell code) %}` interpolations are applied.

```txt
... %template-in-begin:ID% ...

...(INPUT with {% ... %})...

... %template-in-end:ID% ...

... %template-out-begin:ID% ...

...(OUTPUT)...

... %template-out-end:ID% ...
```

## development

```sh
# example
pnpm cli-dev ../icheck-ts/README.md --cwd ../icheck-ts
```
