import fs from "node:fs";
import path from "node:path";
import type {
  MigrationRequest,
  MigrationState,
  MigratorOptions,
} from "./migrator";

//
// raw sql provider/driver
//

export function rawSqlMigrationProvider(options: {
  directory: string;
}): MigratorOptions<string>["provider"] {
  return async () => {
    const requests: MigrationRequest<string>[] = [];

    const nameDirs = await fs.promises.readdir(options.directory, {
      withFileTypes: true,
    });
    for (const nameDir of nameDirs) {
      if (!nameDir.isDirectory()) {
        continue;
      }
      const nameDirPath = path.join(options.directory, nameDir.name);
      const files = await fs.promises.readdir(nameDirPath);
      const foundUp = files.find((f) => f === "up.sql");
      const foundDown = files.find((f) => f === "down.sql");
      if (!foundUp) {
        throw new Error(`'up.sql' not found in '${nameDirPath}'`);
      }
      requests.push({
        name: nameDir.name,
        up: await fs.promises.readFile(
          path.join(nameDirPath, foundUp),
          "utf-8"
        ),
        down: foundDown
          ? await fs.promises.readFile(
              path.join(nameDirPath, foundDown),
              "utf-8"
            )
          : undefined,
      });
    }

    requests.sort((l, r) => l.name.localeCompare(r.name));
    return requests;
  };
}

export function rawSqlMigrationDriver(options: {
  table: string;
  execute: (query: string) => Promise<unknown[]>;
  executeRaw: (query: string) => Promise<void>;
}): MigratorOptions<string>["driver"] {
  // TODO: escape/binding?
  return {
    init: async () => {
      await options.execute(`\
        CREATE TABLE ${options.table} (
          name       VARCHAR(128) NOT NULL PRIMARY KEY,
          executedAt VARCHAR(128) NOT NULL
        )
      `);
    },

    select: async () => {
      try {
        const rows = await options.execute(
          `SELECT * FROM ${options.table} ORDER BY name`
        );
        return rows as MigrationState[];
      } catch (e) {
        throw new Error("Did you forget to run 'init'?", { cause: e });
      }
    },

    insert: async (state) => {
      await options.execute(
        `INSERT INTO ${options.table} (name, executedAt) VALUES ('${state.name}', '${state.executedAt}')`
      );
    },

    delete: async (state) => {
      await options.execute(
        `DELETE FROM ${options.table} WHERE name = '${state.name}'`
      );
    },

    run: async (query) => {
      await options.executeRaw(query);
    },
  };
}
