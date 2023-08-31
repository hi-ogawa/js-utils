import process from "node:process";
import postgres from "postgres";

const devUrl = "postgres://postgres:password@localhost:6432/development";
const url = process.env["DATABASE_URL"] ?? devUrl;
export const sql = postgres(url);
