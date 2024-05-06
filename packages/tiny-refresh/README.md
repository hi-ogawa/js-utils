# tiny-refresh

Simple Vite plugin for React-like component HMR

## usages

```tsx
// vite.config.ts
import { defineConfig } from "vite";
import { vitePluginTinyRefresh } from "@hiogawa/tiny-refresh/vite";

export default defineConfig({
  plugins: [
    vitePluginTinyRefresh({
      runtime: "react", // "preact/compat", "@hiogawa/tiny-react"
    }),
  ],
});
```
