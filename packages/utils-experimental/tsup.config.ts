import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./src/index.ts", "./src/theme-script.ts"],
  format: ["esm", "cjs", "iife"],
  dts: true,
});
