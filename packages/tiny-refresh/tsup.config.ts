import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/vite.ts", "src/webpack.ts"],
  format: ["esm", "cjs"],
  // support old webpack 4
  target: "es5",
  dts: true,
  splitting: false,
});
