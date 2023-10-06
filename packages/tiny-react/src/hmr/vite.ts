import { type FilterPattern, type Plugin, createFilter } from "vite";
import { hmrTransform } from "./transform";

interface TinyReactHmrPluginOptions {
  include?: FilterPattern;
  exclude?: FilterPattern;
}

export function tinyReactHmrPlugin(
  pluginOps?: TinyReactHmrPluginOptions
): Plugin {
  const filter = createFilter(
    pluginOps?.include ?? /\.[tj]sx?$/,
    pluginOps?.exclude
  );
  return {
    name: "@hiogawa/tiny-react/hmr",
    enforce: "pre",
    apply(_config, env) {
      return env.command === "serve" && !env.ssrBuild;
    },
    transform(code, id, _options) {
      // based on https://github.com/vitejs/vite-plugin-react/blob/2c3330b9aa40d263e50e8359eca481099700ca9e/packages/plugin-react/src/index.ts#L168-L171
      if (id.includes("/node_modules/") || !filter(id)) {
        return;
      }
      return hmrTransform(code);
    },
  };
}
