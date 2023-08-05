import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/polyfill-node.ts", "src/cli-node.ts"],
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
});
