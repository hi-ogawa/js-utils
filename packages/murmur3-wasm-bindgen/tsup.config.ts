import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src-js/bundle.ts"],
  format: ["esm"],
  dts: true,
  splitting: false,
  platform: "neutral",
  loader: {
    ".wasm": "binary",
  },
});
