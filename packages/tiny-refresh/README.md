# tiny-refresh

Inspired by simple HMR approach for [`tiny-react`](https://github.com/hi-ogawa/js-utils/pull/144).

Porting the same idea to `react` as a light weight HMR logic,
which requires only `useState` and `useEffect` thus supporing old react v16.

## limitations

- By default, any change will cause components to remount and thus hook states are not preserved.
- Adding `// @hmr-unsafe` comment above the component definition will preserve hook states, but each hot update must keep same hook count.

## usages

```tsx
//
// vite.config.ts
//
import { defineConfig } from "vite";
import { vitePluginTinyRefresh } from "@hiogawa/tiny-refresh/dist/vite";

export default defineConfig({
  plugins: [
    vitePluginTinyRefresh({
      runtime: "react", // "preact/compat", "@hiogawa/tiny-react"
    }),
  ],
});
```
