import { hmrTransform } from "./transform";

export default function tinyRefreshLoader(source: string) {
  return (
    hmrTransform(source, {
      bundler: "webpack4",
      runtime: "react",
      autoDetect: true,
    }) ?? source
  );
}
