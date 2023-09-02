import process from "node:process";
import {
  Migrator,
  MigratorCli,
  rawSqlMigrationDriver,
  rawSqlMigrationProvider,
} from "@hiogawa/tiny-sql";
import { formatError } from "@hiogawa/utils";
import { sql } from "./db";

async function main() {
  const args = process.argv.slice(2);

  const migrator = new Migrator({
    provider: rawSqlMigrationProvider({ directory: "src/migrations" }),
    driver: rawSqlMigrationDriver({
      table: "migrations",
      async execute(query) {
        return sql.unsafe(query);
      },
      async executeRaw(query) {
        await sql.unsafe(query);
      },
    }),
  });

  const migratorCli = new MigratorCli(migrator);
  await migratorCli.parseAndRun(args);
}

async function mainWrapper() {
  try {
    await main();
  } catch (error) {
    console.log(formatError(error));
    process.exitCode = 1;
  } finally {
    await sql.end();
  }
}

mainWrapper();
