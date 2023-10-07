import { typedBoolean } from "@hiogawa/utils";
import { type FilterPattern, type Plugin, createFilter } from "vite";
import { hmrTransform } from "../hmr/transform";

// cf.
// https://github.com/preactjs/preset-vite
// https://github.com/solidjs/vite-plugin-solid
// https://github.com/vitejs/vite-plugin-react

interface TinyReactVitePluginOptions {
  hmr?: {
    include?: FilterPattern;
    exclude?: FilterPattern;
  };
  alias?: {
    disable?: boolean;
  };
}

export function tinyReactVitePlugin(
  options?: TinyReactVitePluginOptions
): Plugin[] {
  return [
    hmrPlugin(options?.hmr),
    !options?.alias?.disable && aliasPlugin(),
  ].filter(typedBoolean);
}

function hmrPlugin(options: TinyReactVitePluginOptions["hmr"]): Plugin {
  // cf. https://github.com/vitejs/vite-plugin-react/blob/2c3330b9aa40d263e50e8359eca481099700ca9e/packages/plugin-react/src/index.ts#L168-L171
  const filter = createFilter(
    options?.include ?? /\.[tj]sx?$/,
    options?.exclude ?? /\/node_modules\//
  );
  return {
    name: "@hiogawa/tiny-react:hmr",
    enforce: "pre",
    apply(_config, env) {
      return env.command === "serve" && !env.ssrBuild;
    },
    transform(code, id, _options) {
      if (filter(id)) {
        return hmrTransform(code);
      }
      return;
    },
  };
}

function aliasPlugin(): Plugin {
  return {
    name: "@hiogawa/tiny-react:alias",
    config(_config, _env) {
      // https://github.com/preactjs/preset-vite/blob/4dfecb379c17fbb2f442987a8ff95536ff290cbd/src/index.ts#L184C1-L190
      return {
        resolve: {
          alias: {
            react: "@hiogawa/tiny-react",
          },
        },
      };
    },
  };
}
