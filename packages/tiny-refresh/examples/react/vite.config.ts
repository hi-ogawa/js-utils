import process from "node:process";
import { vitePluginTinyRefresh } from "@hiogawa/tiny-refresh/vite";
import unocss from "unocss/vite";
import { defineConfig } from "vite";

// allow override runtime to test both react and tiny-react with the same code
//   REACT_COMPAT=@hiogawa/tiny-react pnpm -C packages/tiny-refresh/examples/react dev
const reactCompat = process.env["REACT_COMPAT"];

export default defineConfig({
  plugins: [unocss(), vitePluginTinyRefresh()],
  clearScreen: false,
  esbuild: {
    jsxImportSource: reactCompat,
    // `jsxDev` mode injects `lineNumber` etc...
    // which might affect tiny-refresh's `Function.toString` check and cause redundant refresh.
    // Depending on the use case, disabling jsxDev entirely might be reasonable.
    // jsxDev: false,
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
