import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/vite.ts"],
  format: ["esm"],
  dts: true,
  splitting: false,
});
