import { vitePluginTinyRefresh } from "@hiogawa/tiny-refresh/vite";
import { type FilterPattern, type PluginOption } from "vite";

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
): PluginOption {
  return [
    !options?.hmr?.disable &&
      vitePluginTinyRefresh({
        include: options?.hmr?.include,
        exclude: options?.hmr?.exclude,
        runtime: "@hiogawa/tiny-react",
        refreshRuntime: "@hiogawa/tiny-react/hmr",
      }),
    // https://github.com/preactjs/preset-vite/blob/4dfecb379c17fbb2f442987a8ff95536ff290cbd/src/index.ts#L184C1-L190
    {
      name: "@hiogawa/tiny-react:alias",
      apply: () => !options?.alias?.disable,
      config(_config, _env) {
        return {
          resolve: {
            alias: {
              react: "@hiogawa/tiny-react",
            },
          },
        };
      },
    },
  ];
}
