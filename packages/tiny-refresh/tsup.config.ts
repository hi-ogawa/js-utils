import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/vite.ts", "src/webpack.ts"],
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
});
