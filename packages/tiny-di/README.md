# tiny-di

Extremely simple dependency injection library.
See `./src/index.test.ts` for the basic usage.

The idea is similar to [tsyringe](https://github.com/microsoft/tsyringe)'s constructor injection
but this library has following benefits:

- extreme simplicity (~ 100 LOC)
- it doesn't rely on typescript decorator metadata and thus doesn't require special setup for vite/esbuild based proejcts.
- it provides a dependency graph to implement, for example, own per-module setup/teardown hooks very easily.

# ideas

- https://github.com/microsoft/tsyringe
- https://docs.nestjs.com/fundamentals/lifecycle-events
