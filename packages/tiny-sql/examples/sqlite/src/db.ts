import process from "node:process";
import betterSqlite3 from "better-sqlite3";

export let db: betterSqlite3.Database;

//
// init
//

export function initializeDb() {
  const storage = process.env["SQLITE_STORAGE"] ?? "dev.sqlite3";

  db = new betterSqlite3(storage, {
    verbose: process.env["DEBUG"]?.includes("db")
      ? (...args) => {
          console.log("[debug:db]", ...args);
        }
      : undefined,
  });
}

export function finializeDb() {
  db?.close();
}

//
// quick and simple query builder
//

export function sql<T = Record<string, unknown>>(
  strings: TemplateStringsArray,
  ...values: unknown[]
) {
  const query = strings.raw.join("?");
  const stmt = db.prepare(query).bind(...values);
  const self = {
    all: async (): Promise<T[]> => {
      if (stmt.reader) {
        return stmt.all() as T[];
      }
      stmt.run();
      return [];
    },
    first: async (): Promise<T | undefined> => {
      const rows = await self.all();
      return rows[0];
    },
    firstOrThrow: async (): Promise<T> => {
      const row = await self.first();
      if (typeof row === "undefined") {
        throw new Error("sql.firstOrThrow", { cause: { query, values } });
      }
      return row;
    },
  };
  return self;
}
