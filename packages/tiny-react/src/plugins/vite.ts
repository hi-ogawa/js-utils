import { vitePluginTinyRefresh } from "@hiogawa/tiny-refresh/dist/vite";
import { typedBoolean } from "@hiogawa/utils";
import { type FilterPattern, type Plugin } from "vite";

// cf.
// https://github.com/preactjs/preset-vite
// https://github.com/solidjs/vite-plugin-solid
// https://github.com/vitejs/vite-plugin-react

interface TinyReactVitePluginOptions {
  hmr?: {
    disable?: boolean;
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
    !options?.hmr?.disable &&
      vitePluginTinyRefresh({
        include: options?.hmr?.include,
        exclude: options?.hmr?.exclude,
        runtime: "@hiogawa/tiny-react",
      }),
    !options?.alias?.disable && aliasPlugin(),
  ].filter(typedBoolean);
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
