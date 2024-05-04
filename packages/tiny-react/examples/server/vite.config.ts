import fs from "node:fs";
import path from "node:path";
import { tinyReactVitePlugin } from "@hiogawa/tiny-react/dist/plugins/vite";
import {
  vitePluginLogger,
  vitePluginSsrMiddleware,
} from "@hiogawa/vite-plugin-ssr-middleware";
import {
  type Plugin,
  type PluginOption,
  defineConfig,
  parseAstAsync,
} from "vite";

export default defineConfig((env) => ({
  clearScreen: false,
  plugins: [
    tinyReactVitePlugin(),
    vitePluginClientReference(),
    vitePluginLogger(),
    vitePluginSsrMiddleware({
      entry: process.env["SERVER_ENTRY"] ?? "/src/adapters/node.ts",
      preview: path.resolve("dist/server/index.js"),
    }),
    {
      name: "global-vite-server",
      configureServer(server) {
        (globalThis as any).__vite_server = server;
      },
    },
  ],
  build: {
    outDir: env.isSsrBuild ? "dist/server" : "dist/client",
    sourcemap: true,
    minify: false,
  },
}));

function vitePluginClientReference(): PluginOption {
  const transformPlugin: Plugin = {
    name: vitePluginClientReference.name + ":register",
    async transform(code, id, options) {
      if (options?.ssr && /^("use client"|'use client')/.test(code)) {
        const { exportNames } = await parseExports(code);
        return [
          code,
          `import { registerClientReference as $$register } from "@hiogawa/tiny-react";`,
          ...[...exportNames].map(
            (name) => `$$register(${name}, "${id}#${name}");`
          ),
        ].join("\n");
      }
      return;
    },
  };

  const virtualPlugin = createVirtualPlugin("client-references", async () => {
    const files = await fs.promises.readdir(path.resolve("src"), {
      withFileTypes: true,
      recursive: true,
    });
    const ids: string[] = [];
    for (const file of files) {
      if (file.isFile()) {
        const filepath = path.join(file.path, file.name);
        const code = await fs.promises.readFile(filepath, "utf-8");
        if (/^("use client"|'use client')/.test(code)) {
          ids.push(filepath);
        }
      }
    }
    return [
      "export default {",
      ...ids.map((id) => `"${id}": () => import("${id}"),\n`),
      "}",
    ].join("\n");
  });

  return [transformPlugin, virtualPlugin];
}

async function parseExports(code: string) {
  const ast = await parseAstAsync(code);
  const exportNames = new Set<string>();
  for (const node of ast.body) {
    // named exports
    if (node.type === "ExportNamedDeclaration") {
      if (node.declaration) {
        if (
          node.declaration.type === "FunctionDeclaration" ||
          node.declaration.type === "ClassDeclaration"
        ) {
          /**
           * export function foo() {}
           */
          exportNames.add(node.declaration.id.name);
        } else if (node.declaration.type === "VariableDeclaration") {
          /**
           * export const foo = 1, bar = 2
           */
          for (const decl of node.declaration.declarations) {
            if (decl.id.type === "Identifier") {
              exportNames.add(decl.id.name);
            }
          }
        }
      }
    }
  }
  return {
    exportNames,
  };
}

function createVirtualPlugin(name: string, load: Plugin["load"]) {
  name = "virtual:" + name;
  return {
    name,
    resolveId(source, _importer, _options) {
      if (source === name || source.startsWith(`${name}?`)) {
        return `\0${source}`;
      }
      return;
    },
    load(id, options) {
      if (id === `\0${name}` || id.startsWith(`\0${name}?`)) {
        return (load as any).apply(this, [id, options]);
      }
    },
  } satisfies Plugin;
}
