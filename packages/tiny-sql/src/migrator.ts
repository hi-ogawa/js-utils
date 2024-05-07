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
  logger?: (v: string) => void;
};

export type MigrationRequest<I> = {
  name: string;
  up: I;
  down?: I;
};

export interface MigrationState {
  name: string;
  executed_at: string;
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

  get logger() {
    return this.options.logger ?? console.error;
  }

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
    return this.runMany(completed.slice(-1), "down");
  }

  async latest(): Promise<MigrationResultSet> {
    const { pending } = await this.getRequestStateMap();
    return this.runMany(pending, "up");
  }

  private async getRequestStateMap() {
    // migration order is decided by `provider`
    const requests = await this.options.provider();
    const states = await this.options.driver.select();
    const map: MigrationRequestStateMap<T> = new Map();
    for (const request of requests) {
      map.set(request.name, {
        request,
        state: states.find((s) => s.name === request.name),
      });
    }

    // check if applied migrations are all provided
    const missings = states.filter((s) => !map.has(s.name));
    if (missings.length > 0) {
      this.logger(
        "[warning:migrator] already applied migrations are not provided: " +
          missings.map((s) => s.name).join(", "),
      );
    }

    // check if there are unapplied migrations before applied migrations
    const pairs = [...map.values()];
    for (let i = 0; i < pairs.length - 1; i++) {
      const e1 = pairs[i];
      const e2 = pairs[i + 1];
      if (!e1.state && e2.state) {
        this.logger(
          `[warning:migrator] you have unapplied migration '${e1.request.name}' before applied migration '${e2.request.name}'`,
        );
        break;
      }
    }

    const pending = pairs.filter((e) => !e.state).map((e) => e.request);
    const completed = pairs.filter((e) => e.state).map((e) => e.request);
    return { map, pending, completed };
  }

  private async runMany(
    requests: MigrationRequest<T>[],
    direction: "up" | "down",
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
    direction: "up" | "down",
  ) {
    if (direction === "up") {
      await this.options.driver.run(request.up);
      const executed_at = new Date().toISOString();
      await this.options.driver.insert({ name: request.name, executed_at });
    } else {
      if (request.down) {
        await this.options.driver.run(request.down);
      }
      await this.options.driver.delete({ name: request.name });
    }
  }
}
