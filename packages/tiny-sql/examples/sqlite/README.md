# tiny-sql/examples/sqlite

```sh
$ pnpm migrate init

$ pnpm migrate status
[migrator] migration status
2023-07-08-11-49-30-create-table-counter : (pending)

$ pnpm migrate latest
[migrator] executed migrations
2023-07-08-11-49-30-create-table-counter : success - up

$ pnpm migrate status
[migrator] migration status
2023-07-08-11-49-30-create-table-counter : 2023-07-11T03:46:32.001Z

$ pnpm repl
> await sql`SELECT * from counter`.first()
{ id: 1, value: 0 }
```
