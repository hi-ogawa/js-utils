import { sql } from "./db";

Object.assign(globalThis, { sql });

/*

$ pnpm -s repl
Welcome to Node.js v18.16.0.
Type ".help" for more information.
> await sql`SELECT 1 + 1 as two`
Result(1) [ { two: 2 } ]

*/
