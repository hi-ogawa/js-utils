import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/polyfill.node.ts"],
  format: ["esm", "cjs"],
  dts: true,
});
