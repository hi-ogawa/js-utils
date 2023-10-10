import { hmrTransform } from "./transform";

export default (source: string): string => {
  return (
    hmrTransform(source, {
      bundler: "webpack4",
      runtime: "react",
      autoDetect: true,
    }) ?? source
  );
};
