import process from "node:process";
import {
  Migrator,
  MigratorCli,
  rawSqlMigrationDriver,
  rawSqlMigrationProvider,
} from "@hiogawa/tiny-sql";
import { flattenErrorCauses } from "@hiogawa/utils";
import { consola } from "consola";
import { db, finializeDb, initializeDb } from "./db";

async function main() {
  const args = process.argv.slice(2);

  const migrator = new Migrator({
    provider: rawSqlMigrationProvider({ directory: "src/migrations" }),
    driver: rawSqlMigrationDriver({
      table: "migrations",
      async execute(query) {
        const stmt = db.prepare(query);
        // cf. https://github.com/cloudflare/miniflare/blob/7e4d906e19cc69cd3446512bfeb7f8aee3a2bda7/packages/d1/src/api.ts#L125
        if (stmt.reader) {
          return stmt.all();
        }
        stmt.run();
        return [];
      },
      async executeRaw(query) {
        db.exec(query);
      },
    }),
  });

  const migratorCli = new MigratorCli(migrator);
  await migratorCli.parseAndRun(args);
}

async function mainWrapper() {
  try {
    initializeDb();
    await main();
  } catch (error) {
    for (const e of flattenErrorCauses(error)) {
      consola.error(e);
    }
    process.exitCode = 1;
  } finally {
    finializeDb();
  }
}

mainWrapper();
