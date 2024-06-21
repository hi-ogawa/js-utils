import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/vite.ts", "src/transform.ts", "src/webpack.ts"],
  format: ["esm"],
  dts: true,
});
