import { transformWebpack } from "@hiogawa/tiny-refresh/transform";

/**
 * @type {import("webpack").LoaderDefinitionFunction<{}, {}>}
 */
export default async function loader(input) {
  const callback = this.async();
  const result = await transformWebpack(input, {
    refreshRuntime: "@hiogawa/tiny-refresh",
    runtime: "react",
    debug: true,
  });
  callback(null, result ?? input);
}
