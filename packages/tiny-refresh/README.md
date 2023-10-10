# tiny-refresh

Inspired by simple HMR approach for [`tiny-react`](https://github.com/hi-ogawa/js-utils/pull/144).

Porting the same idea to `react` as a light weight HMR logic,
which requires only `useState` and `useEffect` thus supporing old react v16.

## limitations

- It requires explicit comment `// @hmr` before component declaration.
- Using `// @hmr-unsafe` will preserve hook states, but each hot update must keep same hook count.
- Changes in other components without `// @hmr` won't cause refresh.

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

```tsx
//
// demo.tsx
//
import { useState } from "react";

// @hmr-unsafe
export function Demo(props) {
  const [state, setState] = useState(0);
  ...
}
```
