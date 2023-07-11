# tiny-sql/examples/sqlite

```sh
pnpm migrate init
pnpm migrate status
pnpm migrate latest

pnpm repl
> await sql`SELECT * from counter`.all()
```
