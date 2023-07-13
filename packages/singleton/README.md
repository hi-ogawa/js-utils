# singleton (wip)

tiny helpers for good-old javascript singleton system.

- singleton dependency graph
- module init/deinit callback
- requires [`reflect-metadata`](https://github.com/rbuckton/reflect-metadata)

```tsx
@singleton
class Database {
  async init() {
    // connection
  }

  async deinit() {
    // destroy
  }
}

@singleton
@Reflect.metadata("design:paramtypes", [Database]) // manual annotation if non tsc transpilation
class App {
  constructor(private db: Database) {}
}

const app = singleton.resolve(App);
```
