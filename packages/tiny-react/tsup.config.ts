import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/jsx-types.ts"],
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
});
