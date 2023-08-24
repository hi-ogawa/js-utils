# import-graph

is it possible to do all analyze based on `es-module-lexer`?
maybe it's tricky to support "star" import?
actually it doesn't provide import names? https://github.com/guybedford/es-module-lexer/issues/100
also, of course, typescript syntax parsing is not directly supported.

```
TODO
- rename to `import-graph-ts`?
- modular steps
  - parser
  - path resolver
  - graph builder
```
