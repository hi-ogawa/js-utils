# tiny-refresh

Simple Vite plugin and Webpack loader to enable component HMR for React-like libraries

## usages

See [`./examples/react`]

```tsx
// vite.config.ts
import { defineConfig } from "vite";
import { vitePluginTinyRefresh } from "@hiogawa/tiny-refresh/vite";

export default defineConfig({
  plugins: [
    vitePluginTinyRefresh({
      runtime: "react", // "preact/compat", "@hiogawa/tiny-react", "hono/jsx"
    }),
  ],
});

// webpack.config.js
export default {
  resolve: {
    extensions: [".tsx", ".ts", "..."],
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx$/,
        use: [
          "@hiogawa/tiny-refresh/webpack",
          "esbuild-loader",
        ],
      },
    ],
  },
}
```
