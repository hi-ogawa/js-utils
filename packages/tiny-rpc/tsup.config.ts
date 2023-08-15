import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/zod.ts", "src/index-v2.ts"],
  format: ["esm", "cjs"],
  dts: true,
});
