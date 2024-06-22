import { type FilterPattern, type Plugin, createFilter } from "vite";
import { transform } from "./transform";

export function vitePluginTinyRefresh(options?: {
  include?: FilterPattern;
  exclude?: FilterPattern;
  runtime?: string;
  refreshRuntime?: string;
}): Plugin {
  // cf. https://github.com/vitejs/vite-plugin-react/blob/2c3330b9aa40d263e50e8359eca481099700ca9e/packages/plugin-react/src/index.ts#L168-L171
  const filter = createFilter(
    options?.include ?? /\.[tj]sx$/,
    options?.exclude ?? /\/node_modules\//
  );
  return {
    name: "@hiogawa/tiny-refresh/react/vite",
    apply: "serve",
    transform(code, id, transformOptions) {
      if (!transformOptions?.ssr && filter(id)) {
        return transform(code, {
          runtime: options?.runtime ?? "react",
          refreshRuntime: options?.refreshRuntime ?? "@hiogawa/tiny-refresh",
          mode: "vite",
          debug: true,
        });
      }
      return;
    },
  };
}
