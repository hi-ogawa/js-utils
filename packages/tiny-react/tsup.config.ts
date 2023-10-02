import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/helper/jsx-runtime.ts"],
  format: ["esm", "cjs"],
  dts: true,
});
