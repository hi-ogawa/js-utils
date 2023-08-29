import process from "node:process";
import fs from "node:fs";

const patterns = [
  /.*%template-in-begin:(\w+)%.*/g,
  /.*%template-in-end:(\w+)%.*/g,
  /.*%template-out-begin:(\w+)%.*/g,
  /.*%template-out-end:(\w+)%.*/g,
]

function main() {
  const [infile] = process.argv.slice(2);
  const input = fs.readFileSync(infile, "utf-8");
  const lines = input.split("\n");

  for (const m of input.matchAll(patterns[3])) {
    console.log(m);
  }
}

main();
