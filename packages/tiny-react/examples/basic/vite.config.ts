import { themeScriptPlugin } from "@hiogawa/theme-script/dist/vite";
import react from "@vitejs/plugin-react";
import unocss from "unocss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "./dist/vite",
    minify: true, // set `false` to verify transpilated output easily
  },
  plugins: [
    // test babel transpilation used by this plugin.
    // without the plugin, esbuild will takes care of it based on tsconfig.json.
    false &&
      react({
        jsxImportSource: "@hiogawa/tiny-react",
      }),
    unocss(),
    themeScriptPlugin(),
  ],
});
