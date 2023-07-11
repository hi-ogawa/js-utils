import { db, initializeDb, sql } from "./db";

function main() {
  initializeDb();
  Object.assign(globalThis, { db, sql });
}

main();
