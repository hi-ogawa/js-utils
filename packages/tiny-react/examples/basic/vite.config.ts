import { themeScriptPlugin } from "@hiogawa/theme-script/dist/vite";
import { tinyReactVitePlugin } from "@hiogawa/tiny-react/vite";
import unocss from "unocss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "./dist/vite",
    minify: true, // set `false` to verify transpilated output easily
  },
  plugins: [tinyReactVitePlugin(), unocss(), themeScriptPlugin()],
});
