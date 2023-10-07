import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/helper/jsx-runtime.ts", "src/plugins/vite.ts"],
  format: ["esm", "cjs"],
  dts: true,
});
