import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/jsx.ts"],
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
});
