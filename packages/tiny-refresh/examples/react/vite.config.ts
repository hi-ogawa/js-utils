import process from "node:process";
import { vitePluginTinyRefresh } from "@hiogawa/tiny-refresh/vite";
import { defineConfig } from "vite";

// allow override runtime to test both react and tiny-react with the same code
//   REACT_COMPAT=@hiogawa/tiny-react pnpm -C packages/tiny-refresh/examples/react dev
const reactCompat = process.env["REACT_COMPAT"];

export default defineConfig({
  plugins: [
    vitePluginTinyRefresh({
      runtime: "react",
    }),
  ],
  clearScreen: false,
  esbuild: {
    jsxImportSource: reactCompat,
  },
  resolve: {
    alias: reactCompat
      ? {
          react: reactCompat,
          "react-dom/client": reactCompat,
        }
      : undefined,
  },
});
