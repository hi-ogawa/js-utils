import { type FilterPattern, type Plugin, createFilter } from "vite";
import { hmrTransform } from "./transform";

export function vitePluginTinyRefresh(options?: {
  include?: FilterPattern;
  exclude?: FilterPattern;
  runtime?: string;
  refreshRuntime?: string;
}): Plugin {
  // cf. https://github.com/vitejs/vite-plugin-react/blob/2c3330b9aa40d263e50e8359eca481099700ca9e/packages/plugin-react/src/index.ts#L168-L171
  const filter = createFilter(
    options?.include ?? /\.[tj]sx?$/,
    options?.exclude ?? /\/node_modules\//
  );
  return {
    name: "@hiogawa/tiny-refresh/react/vite",
    enforce: "pre",
    apply(_config, env) {
      return env.command === "serve" && !env.ssrBuild;
    },
    transform(code, id, _options) {
      if (filter(id)) {
        return hmrTransform(code, {
          bundler: "vite",
          runtime: options?.runtime ?? "react",
          refreshRuntime: options?.refreshRuntime,
        });
      }
      return;
    },
  };
}
