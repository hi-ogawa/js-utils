//
// simplified/generalized version of kysely Migrator
// https://github.com/kysely-org/kysely/blob/b7c7f37ad109e377e6cf5e4aefeb1524d735e554/src/migration/migrator.ts#L494-L499
//
// this abstraction itself is zero-dependency and platform agnostic.
// the actual `provider/driver/cli` implementation decides runtime requirement (e.g. filesystem, db driver, etc...)
//

export type MigratorOptions<I> = {
  provider: () => Promise<MigrationRequest<I>[]>;
  driver: {
    init: () => Promise<void>;
    select: () => Promise<MigrationState[]>;
    insert: (result: MigrationState) => Promise<void>;
    delete: (result: Pick<MigrationState, "name">) => Promise<void>;
    run: (input: I) => Promise<void>;
  };
};

export type MigrationRequest<I> = {
  name: string;
  up: I;
  down?: I;
};

export interface MigrationState {
  name: string;
  executedAt: string;
}

export type MigrationRequestStateMap<I> = Map<
  string,
  {
    request: MigrationRequest<I>;
    state?: MigrationState;
  }
>;

export interface MigrationResult {
  name: string;
  direction: "up" | "down";
  status: "success" | "error";
}

export interface MigrationResultSet {
  error?: unknown;
  results: MigrationResult[];
}

export class Migrator<T = unknown> {
  constructor(private options: MigratorOptions<T>) {}

  async init() {
    await this.options.driver.init();
  }

  async status() {
    return await this.getRequestStateMap();
  }

  async up(): Promise<MigrationResultSet> {
    const { pending } = await this.getRequestStateMap();
    return this.runMany(pending.slice(0, 1), "up");
  }

  async down(): Promise<MigrationResultSet> {
    const { completed } = await this.getRequestStateMap();
    return this.runMany(completed.reverse(), "down");
  }

  async latest(): Promise<MigrationResultSet> {
    const { pending } = await this.getRequestStateMap();
    return this.runMany(pending, "up");
  }

  private async getRequestStateMap() {
    const requests = await this.options.provider();
    const states = await this.options.driver.select();
    const map: MigrationRequestStateMap<T> = new Map();
    for (const request of requests) {
      map.set(request.name, {
        request,
        state: states.find((s) => s.name === request.name),
      });
    }

    // check missing request
    const missings = states.filter((s) => !map.has(s.name));
    if (missings.length > 0) {
      console.error(
        "[WARNING] already applied migrations are not found:\n" +
          missings.map((s) => s.name).join("\n")
      );
    }

    const pending = [...map.values()]
      .filter((e) => !e.state)
      .map((e) => e.request);

    // order by `executedAt` instead of `name` (similar to knex's `id` ordering)
    const completed = [...map.values()]
      .filter((e) => e.state)
      .sort((l, r) => l.state!.executedAt.localeCompare(r.state!.executedAt))
      .map((e) => e.request);

    return { map, pending, completed };
  }

  private async runMany(
    requests: MigrationRequest<T>[],
    direction: "up" | "down"
  ) {
    const resultSet: MigrationResultSet = { results: [] };
    for (const request of requests) {
      try {
        await this.runSingle(request, direction);
        resultSet.results.push({
          name: request.name,
          direction,
          status: "success",
        });
      } catch (e) {
        resultSet.error = e;
        resultSet.results.push({
          name: request.name,
          direction,
          status: "error",
        });
        break;
      }
    }
    return resultSet;
  }

  private async runSingle(
    request: MigrationRequest<T>,
    direction: "up" | "down"
  ) {
    if (direction === "up") {
      await this.options.driver.run(request.up);
      const executedAt = new Date().toISOString();
      await this.options.driver.insert({ name: request.name, executedAt });
    } else {
      if (request.down) {
        await this.options.driver.run(request.down);
      }
      await this.options.driver.delete({ name: request.name });
    }
  }
}
