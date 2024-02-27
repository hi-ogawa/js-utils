import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/reference.ts", "src/stream.ts"],
  format: ["esm", "cjs"],
  dts: true,
});
