import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/react/runtime.ts",
    "src/react/vite.ts",
    "src/react/webpack.ts",
  ],
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
});
