# tiny-refresh

Simple HMR for react-like library.
This is made as an easy HMR implementation for [`@hiogawa/tiny-react`](https://github.com/hi-ogawa/js-utils/pull/144).

This simplified runtime architecture is inspired by [`solid-refresh`](https://github.com/solidjs/solid-refresh).

## features/limitations

- Only `createElement`, `useState` and `useEffect` are used internally, thus it uniformly supports `react`, `preact`, and `tiny-react`.
- Simple RegExp based code transform.
- By default, any change will cause components to remount and thus hook states are not preserved.
- Adding `// @hmr-unsafe` comment above the component definition will preserve hook states, but each hot update must keep same hook count.
- Each component will be wrapped with extra component `(ComponentName)_refresh`.
- Changing constants outside of component defnition won't trigger refresh since `Function.toString` is used to detect change.

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
