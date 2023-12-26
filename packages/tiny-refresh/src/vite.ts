import { type FilterPattern, type Plugin, createFilter } from "vite";
import { hmrTransform } from "./transform";

export function vitePluginTinyRefresh(options?: {
  include?: FilterPattern;
  exclude?: FilterPattern;
  runtime?: string;
  refreshRuntime?: string;
  noAutoDetect?: boolean;
}): Plugin {
  // cf. https://github.com/vitejs/vite-plugin-react/blob/2c3330b9aa40d263e50e8359eca481099700ca9e/packages/plugin-react/src/index.ts#L168-L171
  const filter = createFilter(
    options?.include ?? /\.[tj]sx$/,
    options?.exclude ?? /\/node_modules\//
  );
  return {
    name: "@hiogawa/tiny-refresh/react/vite",
    // since esbuild drops comments https://github.com/evanw/esbuild/issues/1439,
    // we need to enforce "pre" to see `// @hmr` comments.
    // however this means that transform has to handle raw source code e.g. typescript and jsx.
    enforce: "pre",
    apply(config, env) {
      return env.command === "serve" && !config.build?.ssr;
    },
    transform(code, id, transformOptions) {
      if (!transformOptions?.ssr && filter(id)) {
        return hmrTransform(code, {
          bundler: "vite",
          runtime: options?.runtime ?? "react",
          refreshRuntime: options?.refreshRuntime,
          autoDetect: !options?.noAutoDetect,
          debug: true,
        });
      }
      return;
    },
  };
}
