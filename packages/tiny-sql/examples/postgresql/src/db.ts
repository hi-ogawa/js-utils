import process from "node:process";
import postgres from "postgres";

const devUrl = "postgres://postgres:password@localhost:6432/development";

const url = process.env["DATABASE_URL"] ?? devUrl;

const debugSql = Boolean(process.env["DEBUG"]?.includes("sql"));

export const sql = postgres(url, {
  debug(connection, query, parameters, paramTypes) {
    if (debugSql) {
      console.log(`[debug:sql:${connection}] ${query}`, parameters, paramTypes);
    }
  },
});
